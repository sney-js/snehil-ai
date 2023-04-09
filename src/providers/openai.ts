import { ChatGPT } from 'chatgpt-official';
import { Configuration, OpenAIApi } from 'openai';
import config from '../utils/config';

let options = {
  temperature: 0.2,
  max_tokens: config.maxModelTokens, // [Max response size by tokens]
  top_p: 0.9,
  frequency_penalty: 0,
  presence_penalty: 0,
  // instructions: ``,
  model: config.openAIModel
};

export const chatgpt = new ChatGPT(config.openAIAPIKey, options); // Note: options is optional

// OpenAI Client (DALL-E)
export const openai = new OpenAIApi(
  new Configuration({
    apiKey: config.openAIAPIKey
  })
);
