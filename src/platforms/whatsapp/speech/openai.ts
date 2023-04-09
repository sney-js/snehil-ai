import config from '../../../config';
import * as os from 'os';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { unlinkSync, writeFileSync } from 'fs';
import { blobFromSync, File } from 'fetch-blob/from';
import * as ffmpeg from 'fluent-ffmpeg';

export async function transcribeOpenAI(
  audioBuffer: Buffer
): Promise<{ text: string; language: string }> {
  const url = config.openAIServerUrl;
  let language = '';

  const tempdir = os.tmpdir();
  const oggPath = path.join(tempdir, randomUUID() + '.ogg');
  const wavFilename = randomUUID() + '.wav';
  const wavPath = path.join(tempdir, wavFilename);
  writeFileSync(oggPath, audioBuffer);
  try {
    await convertOggToWav(oggPath, wavPath);
  } catch (e) {
    unlinkSync(oggPath);
    return {
      text: '',
      language
    };
  }

  // FormData
  const formData = new FormData();
  formData.append(
    'file',
    new File([blobFromSync(wavPath)], wavFilename, { type: 'audio/wav' })
  );
  formData.append('model', 'whisper-1');
  if (config.transcriptionLanguage) {
    formData.append('language', config.transcriptionLanguage);
    language = config.transcriptionLanguage;
  }

  const headers = new Headers();
  headers.append('Authorization', `Bearer ${config.openAIAPIKey}`);

  // Request options
  const options = {
    method: 'POST',
    body: formData,
    headers
  };

  let response;
  try {
    response = await fetch(url, options);
  } catch (e) {
    console.error(e);
  } finally {
    unlinkSync(oggPath);
    unlinkSync(wavPath);
  }

  if (!response || response.status != 200) {
    console.error(response);
    return {
      text: '',
      language: language
    };
  }

  const transcription = await response.json();
  return {
    text: transcription.text,
    language
  };
}

async function convertOggToWav(
  oggPath: string,
  wavPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(oggPath)
      .toFormat('wav')
      .outputOptions('-acodec pcm_s16le')
      .output(wavPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}
