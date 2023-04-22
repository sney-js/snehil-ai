import { ChatGPT } from 'chatgpt-official';
import { Configuration, OpenAIApi } from 'openai';
import process from 'process';
import getConfig, { IConfig } from '../configs/config';

class OpenAI {
  private config: IConfig;
  private chatGPT: ChatGPT;
  private openAI;

  private static _instance?: OpenAI;
  private configuration: Configuration;

  constructor(_config?: IConfig) {
    if (!this.config) {
      this.config = _config || getConfig();
    }
    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
    OpenAI._instance = this;
  }

  public static getInstance(): OpenAI {
    return OpenAI._instance || new OpenAI();
  }

  public async getChatGPT(): Promise<ChatGPT> {
    if (!this.chatGPT) {
      let options: ChatGPT['options'] = {
        temperature: 0.2,
        max_tokens: parseInt(process.env.MAX_MODEL_TOKENS || '500'), // [Max response size by tokens]
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
        // instructions: this.config.prePrompt,
        model: process.env.OPENAI_GPT_MODEL || 'gpt-3.5-turbo'
      };

      this.chatGPT = new ChatGPT([process.env.OPENAI_API_KEY || ''], options);
      await new Promise((resolve) => setTimeout(() => resolve(true), 500));
    }
    //delaying because of race condition in poor chatgtp library code
    return this.chatGPT;
  }

  public async testChatGPTPing() {
    console.log('Testing OpenAI Connection...');
    let chatGPT = await this.getChatGPT();
    return chatGPT
      .ask('Say hi if you are receiving this')
      .then((res) => {
        console.log('Successful ChatGPT response', res);
        return true;
      })
      .catch((e) => {
        console.error('Error connecting to OpenAI');
        console.error(e);
        throw e;
      });
  }

  public getOpenAI() {
    if (!this.openAI) {
      this.openAI = new OpenAIApi(this.configuration);
    }
    return this.openAI;
  }
}

export default OpenAI;
