import OpenAI from '../providers/OpenAI';
import getConfig from '../configs/config';
import * as cli from '../ui/cli';

// Moderation
import { moderateIncomingPrompt } from './moderation';
import { CreateImageRequestSizeEnum } from 'openai';

const handleMessageDALLE = async (
  prompt: string,
  size: 512 | 256 | 1024 = 512
): Promise<string> => {
  const openAI = OpenAI.getInstance().getOpenAI();
  const config = getConfig();
  try {
    cli.print(`[DALL-E] Received prompt from  ${prompt}`);

    // Prompt Moderation
    if (config.promptModerationEnabled) {
      await moderateIncomingPrompt(prompt);
    }

    // Send the prompt to the API
    const response = await openAI.createImage({
      prompt,
      n: 1,
      size: `${size}x${size}` as CreateImageRequestSizeEnum,
      response_format: 'b64_json'
    });

    return response.data.data[0].b64_json as string;
  } catch (error: any) {
    console.error('An error occured', error);
    throw Error(error);
  }
};

export { handleMessageDALLE };
