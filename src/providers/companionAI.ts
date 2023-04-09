import { handleResetConversation, handleMessageGPT } from '../handlers/gpt';
import { handleMessageDALLE } from '../handlers/dalle';
import { handleMessageAIConfig } from '../platforms/whatsapp/AdminConfig';
import { IConfig } from '../utils/config';

export class CompanionAI {
  generalConfig: IConfig;

  public constructor(config: IConfig) {
    this.generalConfig = Object.assign({}, config);
  }

  public initialise() {}

  protected handleRequestChatbot(
    prompt,
    conversationID,
    from?
  ): Promise<string> {
    return handleMessageGPT(conversationID, prompt);
  }

  protected handleRequestImageAI(prompt): Promise<string> {
    return handleMessageDALLE(prompt);
  }

  protected handleRequestAdmin(prompt): Promise<void> {
    return handleMessageAIConfig(prompt);
  }

  protected handleRequestResetConversation(conversationID): Promise<string> {
    return handleResetConversation(conversationID);
  }
}
