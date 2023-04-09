import { randomUUID } from 'crypto';
import { chatgpt } from '../providers/openai';
import * as cli from '../ui/cli';
import config from '../config';

// Moderation
import { moderateIncomingPrompt } from './moderation';

// Mapping from number to last co
// nversation id
const conversations = {};

const handleMessageGPT = async (
  conversationID: string,
  prompt: string
): Promise<string> => {
  try {
    // Get last conversation
    const lastConversationId = conversations[conversationID];

    // Prompt Moderation
    if (config.promptModerationEnabled) {
      try {
        await moderateIncomingPrompt(prompt);
      } catch (error: any) {
        // message.reply(error.message);
        return error.message;
      }
    }

    const start = Date.now();

    // Check if we have a conversation with the user
    let response: string;
    if (lastConversationId) {
      // Handle message with previous conversation
      response = await chatgpt.ask(prompt, lastConversationId);
    } else {
      // Create new conversation
      const convId = randomUUID();
      const conv = chatgpt.addConversation(convId);

      // Set conversation
      conversations[conversationID] = conv.id;

      cli.print(`[GPT] New conversation for ${conversationID} (ID: ${conv.id})`);

      // Pre prompt
      if (config.prePrompt != null && config.prePrompt.trim() != '') {
        cli.print(`[GPT] Pre prompt: ${config.prePrompt}`);
        const prePromptResponse = await chatgpt.ask(config.prePrompt, conv.id);
        cli.print('[GPT] Pre prompt response: ' + prePromptResponse);
      }

      // Handle message with new conversation
      response = await chatgpt.ask(prompt, conv.id);
    }

    const end = Date.now() - start;

    cli.print(
      `[GPT] Answer to ${conversationID}: ${response}  | OpenAI request took ${end}ms)`
    );

    // TTS reply (Default: disabled)
    // if (config.ttsEnabled) {
    //   sendVoiceMessageReply(message, response);
    //   return;
    // }

    // Default: Text reply
    // message.reply(response);
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

const handleDeleteConversation = async (from: string): Promise<string> => {
  // Delete conversation
  delete conversations[from];

  // Reply
  return 'Conversation context has been reset!';
};

export { handleMessageGPT, handleDeleteConversation };
