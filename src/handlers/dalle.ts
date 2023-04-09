import { openai } from '../providers/openai';
import { aiConfig } from './ai-config';
import { CreateImageRequestSizeEnum } from 'openai';
import config from '../config';
import * as cli from '../ui/cli';

// Moderation
import { moderateIncomingPrompt } from './moderation';

const handleMessageDALLE = async (prompt: any): Promise<string> => {
  try {
    cli.print(`[DALL-E] Received prompt from  ${prompt}`);

    // Prompt Moderation
    if (config.promptModerationEnabled) {
      await moderateIncomingPrompt(prompt);
    }

    // Send the prompt to the API
    const response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: aiConfig.dalle.size as CreateImageRequestSizeEnum,
      response_format: 'b64_json'
    });

    return response.data.data[0].b64_json as string;
  } catch (error: any) {
    console.error('An error occured', error);
    throw Error(error);
  }
};

export { handleMessageDALLE };
