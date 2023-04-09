import { WhatsAppBot } from './platforms/whatsapp';
import config from './utils/config';

const whatsappBot = new WhatsAppBot(config);
whatsappBot.initialise().catch();
