import * as cli from '../ui/cli';
import getConfig from '../configs/config';
import OpenAI from '../providers/OpenAI';

/**
 * Handle prompt moderation
 *
 * @param prompt Prompt to moderate
 * @returns true if the prompt is safe, throws an error otherwise
 */
const moderateIncomingPrompt = async (prompt: string) => {
  const openAI = OpenAI.getInstance().getOpenAI();
  // cli.print('[MODERATION] Checking user prompt...');
  const moderationResponse = await openAI.createModeration({
    input: prompt
  });

  const moderationResponseData = moderationResponse.data;
  const moderationResponseCategories =
    moderationResponseData.results[0].categories;
  let config = getConfig();

  const blackListedCategories = config.promptModerationBlacklistedCategories;

  // Print categories as [ category: true/false ]
  const categoriesForPrint = Object.keys(moderationResponseCategories).map(
    (category) => {
      return `${category}: ${moderationResponseCategories[category]}`;
    }
  );
  // cli.print(
  //   `[MODERATION] OpenAI Moderation response: ${JSON.stringify(
  //     categoriesForPrint
  //   )}`
  // );

  // Check if any of the blacklisted categories are set to true
  for (const category of blackListedCategories) {
    if (moderationResponseCategories[category]) {
      throw new Error(
        `Prompt was rejected by the moderation system. Reason: ${category}`
      );
    }
  }

  return true;
};

export { moderateIncomingPrompt };
