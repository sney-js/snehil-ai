# OpenAI + DALL-E + WhatsApp = Your AI Companion

This WhatsApp bot uses OpenAI's GPT and DALL-E 2 to respond to user inputs.


## Requirements

-   Node.js (18 or newer)
-   Docker
-   An [OpenAI API key](https://beta.openai.com/signup)
-   A WhatsApp account

## Setting up

Edit the `src/configs/bot-config.json` to your parameters. Master refers to your name. The AI has been conditioned to be a personal helper and you are their master. Example:

### `bot-config.json`
```json
{
  "triggers": {
    "aiChat": "@snehil-ai",
    "aiImage": "@snehil-ai-image",
    "aiReset": "@snehil-ai-reset",
    "aiAdmin": "@snehil-ai-admin",
    "chatPlatform": "Whatsapp"
  },
  "traits": {
    "masterName": "Snehil",
    "masterInfo": "30 year old Technical Architect living in London who speaks English and Hindi.",
    "masterPersonality": "witty, warm, educated, funny",
    "botPersonality": "sarcastic, brief, funny, emotional",
    "botCaveats": "If messages are exchanged after a day, give a greeting first.",
    "botFallback": "Hmm I think you should ask the real Snehil for this one"
  },
  "training": {
    "masterChatExamples": [
      "Enjoying this great weather this saturday in london?",
      "Pretty good. Chilled today as well. Back in London too now",
      "Bold! I like it",
      "Sometime next week after work?",
      "How you feeling?",
      "Drink protein. Who knows you'll be cured tomorrow"
    ]
  },
  "responsePreferences": {
    "maxTokens": "500",
    "temperature": 0.2,
    "generalMessageLength": 30
  }
}

```

### Schema for bot-config:

```ts
type PersonalConfigType = {
  triggers: {
    /**
     * What keyword within whatsapp chat should trigger the ai
     */
    aiChat: string;
    /**
     * For image generation
     */
    aiImage: string;
    /**
     * When context becomes too big, call this to reset the bot.
     */
    aiReset: string;
    /**
     * Use this in your personal chat with yourself to inform AI
     * of people in private
     */
    aiAdmin: string;
    /**
     * For AI to know which platform is it running on
     */
    chatPlatform: string;
  };
  traits: {
    masterName: string;
    masterInfo: string;
    masterPersonality: string;
    botPersonality?: string;
    /**
     * Key instructions to give to bot.
     */
    botCaveats: string;
    /**
     * When AI doesn't know anything, we'd like to avoid the
     * usual 'As an AI, built by OpenAI, I cannot...'
     */
    botFallback: string;
  };
  training: {
    /**
     * Use this to show your chat message style
     */
    masterChatExamples: string[] | null
  };
  /**
   * Technical adjustments when connecting to OpenAI APIs
   */
  responsePreferences: {
    maxTokens: string;
    temperature: number;
    generalMessageLength: number;
  };
};
```

## Running AI Bot Locally for Test

Converse with the bot as per your config locally for testing.

1. `npm run start:terminal`
2. Type in terminal!

## Running Whatsapp Bot Locally

1. `npm run start`
2. Log in to your whatsapp with the QR code.
3. AI Bot is now connected!

## Deploying Whatsapp Bot on a server
1. Set up a node server running somewhere. E.g. EC2, Heroku.
2. `ssh` into your node server.
3. git clone into a `ai-companion` directory.
4. run `run.sh` via terminal. (can be used on new code updates)
5. Log in to your whatsapp with the QR code.
6. AI Bot is now connected!
7. You can ssh out, the server will run forever while your whatsapp connected to the bot. 
