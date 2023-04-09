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

// For deciding to ignore old messages
import { Message, MessageMedia } from 'whatsapp-web.js';

type RequestOptions = {
  requestedConfigChange: boolean;
  requestedReset: boolean;
  requestedChatAI: boolean;
  requestedImageAI: boolean;
  any: boolean;
};

function getPrompt(body: string, requestOptions: RequestOptions) {
  if (requestOptions.requestedChatAI) {
    return body.substring(config.gptPrefix.length + 1);
  }
  if (requestOptions.requestedImageAI) {
    return body.substring(config.dallePrefix.length + 1);
  }
  if (requestOptions.requestedConfigChange) {
    return body.substring(config.aiConfigPrefix.length + 1);
  }
  if (requestOptions.requestedReset) {
    return body.substring(config.resetPrefix.length + 1);
  }
  return body;
}

function isCompanionRelevantMessage(message): RequestOptions {
  const values = {
    requestedChatAI: startsWithIgnoreCase(message, config.gptPrefix),
    requestedImageAI: startsWithIgnoreCase(message, config.dallePrefix),
    requestedConfigChange: startsWithIgnoreCase(message, config.aiConfigPrefix),
    requestedReset: startsWithIgnoreCase(message, config.resetPrefix),
    any: false
  };
  values.any =
    values.requestedChatAI ||
    values.requestedImageAI ||
    values.requestedConfigChange ||
    values.requestedReset;
  return values;
}

// Handles message
async function handleIncomingMessage(message: Message): Promise<void> {
  const { body, from, fromMe, hasQuotedMsg, to } = message;

  const requestOptions = isCompanionRelevantMessage(body);
  // no proessing needed. Ignore message.
  if (!requestOptions.any) return;

  let prompt = getPrompt(body, requestOptions);

  // Ignore groupchats if disabled
  let isGroupChat = (await message.getChat())?.isGroup;
  if (isGroupChat && !config.groupchatsEnabled) return;

  if (hasQuotedMsg) {
    const repliedMessage: Message = await message.getQuotedMessage();
    prompt += `----\n${repliedMessage.body}`;
  }

  if (requestOptions.requestedReset) {
    cli.print(`[RESET] Received prompt from ${from}: ${prompt}`);
    await handleDeleteConversation(from).then((res) => message.reply(res));
    return;
  }

  if (requestOptions.requestedConfigChange) {
    console.log(`[AI-Config] Received prompt from ${from}: ${prompt}`);
    await handleMessageAIConfig(prompt).then((res) => message.reply(res));
    return;
  }

  if (requestOptions.requestedChatAI) {
    cli.print(`[GPT] Received prompt from ${from}: ${prompt}`);
    await handleMessageGPT(from, prompt).then((res) => message.reply(res));
    return;
  }

  if (requestOptions.requestedImageAI) {
    const start = Date.now();
    cli.print(`[DALL-E] Received prompt from ${from}: ${prompt}`);
    await handleMessageDALLE(prompt)
      .then((base64) => {
        const image = new MessageMedia('image/jpeg', base64, 'image.jpg');

        const end = Date.now() - start;
        cli.print(`[DALL-E] Answer to ${from} | OpenAI request took ${end}ms`);

        message.reply(image);
      })
      .catch((err) => {
        message.reply('An error happened: ' + err.message);
      });
    return;
  }
}

export { handleIncomingMessage };
