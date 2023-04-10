import * as cli from '../../ui/cli';
import { CompanionAI } from '../../providers/companionAI';
import prompts from 'prompts';
import OpenAI from '../../providers/OpenAI';
import { ChatGPT } from 'chatgpt-official';
import { randomUUID } from 'crypto';

export class TerminalBot extends CompanionAI {
  botReadyTimestamp: Date | null = null;
  private chatGPT: ChatGPT;
  private conversationID: string;

  override async initialise() {
    cli.printIntro();
    cli.printOutro();

    // Set bot ready timestamp
    this.botReadyTimestamp = new Date();
    this.chatGPT = OpenAI.getInstance().getChatGPT();
    this.conversationID = randomUUID();
    await this.startGPTChat();
  }

  async startGPTChat() {
    await prompts({
      type: 'text',
      name: 'answer',
      message: 'You:'
    })
      .then((response) => {
        if (response.answer === '!q') process.exit(0);

        return this.chatGPT.ask(
          response.answer,
          this.conversationID,
          'John Doe'
        );
      })
      .then((response) => {
        console.log('GPT:', response);
        return this.startGPTChat();
      });
  }
}
