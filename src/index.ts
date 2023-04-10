import { WhatsAppBot } from './platforms/whatsapp';
import getConfig, { IConfig } from './configs/config';
import OpenAI from './providers/OpenAI';

(async function () {
  const config: IConfig = getConfig();

  await OpenAI.getInstance().testChatGPTPing();

  const whatsappBot = new WhatsAppBot(config);
  whatsappBot.initialise().catch();
})();
