import * as process from 'process';

// Environment variables
import * as dotenv from 'dotenv';
dotenv.config();

// Config Interface
interface IConfig {
  // OpenAI
  openAIAPIKey: string;
  openAIModel: string;
  maxModelTokens: number;
  prePrompt: string | undefined;

  // Prefix
  prefixEnabled: boolean;
  prefixSkippedForMe: boolean;
  gptPrefix: string;
  dallePrefix: string;
  resetPrefix: string;
  aiConfigPrefix: string;

  // Groupchats
  groupchatsEnabled: boolean;

  // Prompt Moderation
  promptModerationEnabled: boolean;
  promptModerationBlacklistedCategories: string[];
}

// Config
const config: IConfig = {
  openAIAPIKey: process.env.OPENAI_API_KEY || '', // Default: ""
  openAIModel: process.env.OPENAI_GPT_MODEL || 'gpt-3.5-turbo', // Default: gpt-3.5-turbo
  maxModelTokens: getEnvMaxModelTokens(), // Default: 4096
  prePrompt: process.env.PRE_PROMPT, // Default: undefined

  // Prefix
  prefixEnabled: getEnvBooleanWithDefault('PREFIX_ENABLED', true), // Default: true
  prefixSkippedForMe: getEnvBooleanWithDefault('PREFIX_SKIPPED_FOR_ME', true), // Default: true
  gptPrefix: process.env.GPT_PREFIX || '!gpt', // Default: !gpt
  dallePrefix: process.env.DALLE_PREFIX || '!dalle', // Default: !dalle
  resetPrefix: process.env.RESET_PREFIX || '!reset', // Default: !reset
  aiConfigPrefix: process.env.AI_CONFIG_PREFIX || '!config', // Default: !config

  // Groupchats
  groupchatsEnabled: getEnvBooleanWithDefault('GROUPCHATS_ENABLED', false), // Default: false

  // Prompt Moderation
  promptModerationEnabled: getEnvBooleanWithDefault(
    'PROMPT_MODERATION_ENABLED',
    false
  ), // Default: false
  promptModerationBlacklistedCategories:
    getEnvPromptModerationBlacklistedCategories(), // Default: ["hate", "hate/threatening", "self-harm", "sexual", "sexual/minors", "violence", "violence/graphic"]
};

/**
 * Get the max model tokens from the environment variable
 * @returns The max model tokens from the environment variable or 4096
 */
function getEnvMaxModelTokens() {
  const envValue = process.env.MAX_MODEL_TOKENS;
  if (envValue == undefined || envValue == '') {
    return 4096;
  }

  return parseInt(envValue);
}

/**
 * Get an environment variable as a boolean with a default value
 * @param key The environment variable key
 * @param defaultValue The default value
 * @returns The value of the environment variable or the default value
 */
function getEnvBooleanWithDefault(key: string, defaultValue: boolean): boolean {
  const envValue = process.env[key]?.toLowerCase();
  if (envValue == undefined || envValue == '') {
    return defaultValue;
  }

  return envValue == 'true';
}

/**
 * Get the blacklist categories for prompt moderation from the environment variable
 * @returns Blacklisted categories for prompt moderation
 */
function getEnvPromptModerationBlacklistedCategories(): string[] {
  const envValue = process.env.PROMPT_MODERATION_BLACKLISTED_CATEGORIES;
  if (envValue == undefined || envValue == '') {
    return [
      'hate',
      'hate/threatening',
      'self-harm',
      'sexual',
      'sexual/minors',
      'violence',
      'violence/graphic'
    ];
  } else {
    return JSON.parse(envValue.replace(/'/g, '"'));
  }
}

export default config;
