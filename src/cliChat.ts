import { TerminalBot } from './platforms/terminal';
import getConfig, { IConfig } from './configs/config';
import OpenAI from './providers/OpenAI';

(async function () {
  const config: IConfig = getConfig();
  console.log(config, 'config');

  await OpenAI.getInstance().testChatGPTPing();

  const whatsappBot = new TerminalBot(config);
  whatsappBot.initialise().catch();
})();
