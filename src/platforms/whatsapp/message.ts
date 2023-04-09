import { startsWithIgnoreCase } from '../../utils';

// Config & Constants
import config from '../../config';

// CLI
import * as cli from '../../ui/cli';

// ChatGPT & DALLE
import { handleDeleteConversation, handleMessageGPT } from '../../handlers/gpt';
import { handleMessageDALLE } from '../../handlers/dalle';
import { handleMessageAIConfig } from '../../handlers/ai-config';

// Speech API & Whisper
import { TranscriptionMode, TTSMode } from './speech/transcription-mode';
import {
  transcribeRequest,
  ttsRequest as speechTTSRequest
} from './speech/speech';
import { transcribeAudioLocal } from './speech/whisper-local';
import { transcribeWhisperApi } from './speech/whisper-api';

// For deciding to ignore old messages
import { transcribeOpenAI } from './speech/openai';
import { Message, MessageMedia } from 'whatsapp-web.js';
import { ttsRequest as awsTTSRequest } from './speech/aws';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import fs from 'fs';

// Handles message
async function handleIncomingMessage(message: Message) {
  let messageString = message.body;
  let transcribedMessage;
  // Ignore groupchats if disabled
  if ((await message.getChat()).isGroup && !config.groupchatsEnabled) return;

  // Transcribe audio
  if (message.hasMedia) {
    transcribedMessage = await getTranscription(message);

    // Check transcription is null (error)
    if (transcribedMessage == null || transcribedMessage.length == 0) {
      message.reply("I couldn't understand what you said.");
      return;
    } else {
      // Log transcription
      cli.print(
        `[Transcription] Transcription response: ${transcribedMessage}`
      );

      // Reply with transcription
      message.reply(`You said: ${transcribedMessage}`);
    }
  }

  // Clear conversation context (!clear)
  if (startsWithIgnoreCase(messageString, config.resetPrefix)) {
    await handleDeleteConversation(message.from);
    return;
  }

  // AiConfig (!config <args>)
  if (startsWithIgnoreCase(messageString, config.aiConfigPrefix)) {
    const prompt = messageString.substring(config.aiConfigPrefix.length + 1);
    console.log(
      '[AI-Config] Received prompt from ' + message.from + ': ' + prompt
    );
    await handleMessageAIConfig(prompt).then((reply) => message.reply(reply));
    return;
  }

  // GPT (!gpt <prompt>)
  if (
    startsWithIgnoreCase(messageString, config.gptPrefix) ||
    transcribedMessage
  ) {
    messageString =
      transcribedMessage ||
      messageString.substring(config.gptPrefix.length + 1);
    await handleMessageGPT(message.from, messageString).then((reply) =>
      message.reply(reply)
    );
    return;
  }

  const selfNotedMessage =
    message.fromMe &&
    message.hasQuotedMsg === false &&
    message.from === message.to;

  if (
    !config.prefixEnabled ||
    (config.prefixSkippedForMe && selfNotedMessage)
  ) {
    await handleMessageGPT(message.from, messageString).then((reply) =>
      message.reply(reply)
    );
    return;
  }

  // DALLE (!dalle <prompt>)
  if (startsWithIgnoreCase(messageString, config.dallePrefix)) {
    messageString = messageString.substring(config.dallePrefix.length + 1);
    const start = Date.now();
    await handleMessageDALLE(messageString)
      .then((base64) => {
        const image = new MessageMedia('image/jpeg', base64, 'image.jpg');

        const end = Date.now() - start;
        cli.print(
          `[DALL-E] Answer to ${message.from} | OpenAI request took ${end}ms`
        );

        message.reply(image);
      })
      .catch((err) => {
        message.reply('An error happened: ' + err.message);
      });
    return;
  }
}

async function getTranscription(message: Message) {
  const media = await message.downloadMedia();

  // Ignore non-audio media
  if (!media || !media.mimetype.startsWith('audio/')) return null;

  // Check if transcription is enabled (Default: false)
  if (!config.transcriptionEnabled) {
    cli.print(
      '[Transcription] Received voice messsage but voice transcription is disabled.'
    );
    return;
  }

  // Convert media to base64 string
  const mediaBuffer = Buffer.from(media.data, 'base64');

  // Transcribe locally or with Speech API
  cli.print(
    `[Transcription] Transcribing audio with "${config.transcriptionMode}" mode...`
  );

  let res;
  switch (config.transcriptionMode) {
    case TranscriptionMode.Local:
      res = await transcribeAudioLocal(mediaBuffer);
      break;
    case TranscriptionMode.OpenAI:
      res = await transcribeOpenAI(mediaBuffer);
      break;
    case TranscriptionMode.WhisperAPI:
      res = await transcribeWhisperApi(new Blob([mediaBuffer]));
      break;
    case TranscriptionMode.SpeechAPI:
      res = await transcribeRequest(new Blob([mediaBuffer]));
      break;
    default:
      cli.print(
        `[Transcription] Unsupported transcription mode: ${config.transcriptionMode}`
      );
  }
  const { text: transcribedText, language: transcribedLanguage } = res;

  return transcribedText;
}

async function sendVoiceMessageReply(
  message: Message,
  gptTextResponse: string
) {
  var logTAG = '[TTS]';
  var ttsRequest = async function (): Promise<Buffer | null> {
    return await speechTTSRequest(gptTextResponse);
  };

  switch (config.ttsMode) {
    case TTSMode.SpeechAPI:
      logTAG = '[SpeechAPI]';
      ttsRequest = async function (): Promise<Buffer | null> {
        return await speechTTSRequest(gptTextResponse);
      };
      break;

    case TTSMode.AWSPolly:
      logTAG = '[AWSPolly]';
      ttsRequest = async function (): Promise<Buffer | null> {
        return await awsTTSRequest(gptTextResponse);
      };
      break;

    default:
      logTAG = '[SpeechAPI]';
      ttsRequest = async function (): Promise<Buffer | null> {
        return await speechTTSRequest(gptTextResponse);
      };
      break;
  }

  // Get audio buffer
  cli.print(
    `${logTAG} Generating audio from GPT response "${gptTextResponse}"...`
  );
  const audioBuffer = await ttsRequest();

  // Check if audio buffer is valid
  if (audioBuffer == null || audioBuffer.length == 0) {
    message.reply(
      `${logTAG} couldn't generate audio, please contact the administrator.`
    );
    return;
  }

  cli.print(`${logTAG} Audio generated!`);

  // Get temp folder and file path
  const tempFolder = os.tmpdir();
  const tempFilePath = path.join(tempFolder, randomUUID() + '.opus');

  // Save buffer to temp file
  fs.writeFileSync(tempFilePath, audioBuffer);

  // Send audio
  const messageMedia = new MessageMedia(
    'audio/ogg; codecs=opus',
    audioBuffer.toString('base64')
  );
  message.reply(messageMedia);

  // Delete temp file
  fs.unlinkSync(tempFilePath);
}

export { handleIncomingMessage };
