import OpenAI from '../providers/OpenAI';
import * as cli from '../ui/cli';
import getConfig from '../configs/config';
import { moderateIncomingPrompt } from './moderation';

const handleMessageGPT = async (
  conversationID: string,
  prompt: string,
  username?: string
): Promise<string> => {
  const chatGPT = await OpenAI.getInstance().getChatGPT();
  const config = getConfig();

  try {
    if (config.promptModerationEnabled) {
      try {
        await moderateIncomingPrompt(prompt);
      } catch (error: any) {
        return error.message;
      }
    }
    const conv = chatGPT.getConversation(conversationID);
    if (conv.messages.length === 0) {
      cli.print(
        `[GPT] New conversation for ${conversationID} (ID: ${conv.id})`
      );
      // Pre prompt
      if (config.prePrompt) {
        cli.print(`[GPT] Sending pre-prompt!`);
        const prePromptResponse = await chatGPT.ask(config.prePrompt, conv.id);
        cli.print('[GPT] Pre prompt response: ' + prePromptResponse);
      }
    }

    return await chatGPT.ask(prompt, conversationID, username);
  } catch (error: any) {
    console.error('An error occured', error);
    return `An error occured, please contact the administrator. (${error.message})`;
  }
};

const handleResetConversation = async (convID: string): Promise<string> => {
  const chatGPT = await OpenAI.getInstance().getChatGPT();
  chatGPT.resetConversation(convID);
  return 'Conversation context has been reset!';
};

export { handleMessageGPT, handleResetConversation };
