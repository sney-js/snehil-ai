import { randomUUID } from 'crypto';
import OpenAI from '../providers/OpenAI';
import * as cli from '../ui/cli';
import getConfig from '../configs/config';
import { moderateIncomingPrompt } from './moderation';

const conversations = {};

const handleMessageGPT = async (
  conversationID: string,
  prompt: string,
  username?: string
): Promise<string> => {
  const chatGPT = OpenAI.getInstance().getChatGPT();
  const config = getConfig();

  try {
    // Get last conversation
    const lastConversationId = conversations[conversationID];

    // Prompt Moderation
    if (config.promptModerationEnabled) {
      try {
        await moderateIncomingPrompt(prompt);
      } catch (error: any) {
        return error.message;
      }
    }

    // Check if we have a conversation with the user
    let response: string;
    if (lastConversationId) {
      // Handle message with previous conversation
      response = await chatGPT.ask(prompt, lastConversationId, username);
    } else {
      // Create new conversation
      const convId = randomUUID();
      const conv = chatGPT.addConversation(convId);

      // Set conversation
      conversations[conversationID] = conv.id;

      cli.print(
        `[GPT] New conversation for ${conversationID} (ID: ${conv.id})`
      );

      // Pre prompt
      /*
      if (config.prePrompt != null && config.prePrompt.trim() != '') {
        cli.print(`[GPT] Pre prompt sent!`);
        let preprompt = `${config.prePrompt}
        ----
Summarise what you have learnt and understood via this setup.`;
        const prePromptResponse = await chatGPT.ask(preprompt, conv.id);
        cli.print('[GPT] Pre prompt response: ' + prePromptResponse);
        // let summary = `Summarise what you have learnt and understood via this setup.`;
        // const summaryResp = await chatGPT.ask(summary, conv.id);
        // cli.print('[GPT] Pre prompt understanding: ' + summaryResp);
      }
*/

      response = await chatGPT.ask(prompt, conv.id);
    }

    return response;
  } catch (error: any) {
    console.error('An error occured', error);
    return (
      'An error occured, please contact the administrator. (' +
      error.message +
      ')'
    );
  }
};

const handleResetConversation = async (from: string): Promise<string> => {
  delete conversations[from];
  return 'Conversation context has been reset!';
};

export { handleMessageGPT, handleResetConversation };
