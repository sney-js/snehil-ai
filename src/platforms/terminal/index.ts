import { CompanionAI } from '../../providers/companionAI';
import prompts from 'prompts';
import { randomUUID } from 'crypto';

export class TerminalBot extends CompanionAI {
  private conversationID: string;

  override async initialise() {
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
        if (response.answer === '!reset') {
          return this.handleRequestResetConversation(this.conversationID);
        }

        return this.handleRequestChatbot(
          response.answer,
          this.conversationID,
          'John Doe'
        ).then((res) => {
          console.log('GPT:', res);
          return res;
        });
      })
      .then(() => {
        return this.startGPTChat();
      });
  }
}
