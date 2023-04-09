import * as qrcode from 'qrcode-terminal';
import { Client, Message, Events, LocalAuth } from 'whatsapp-web.js';

// Constants
import constants from './constants';

// CLI
import * as cli from '../../ui/cli';
import { handleIncomingMessage } from './message';

// Ready timestamp of the bot
let botReadyTimestamp: Date | null = null;

// Entrypoint
const start = async () => {
  cli.printIntro();

  // WhatsApp Client
  const client = new Client({
    puppeteer: {
      args: ['--no-sandbox']
    },
    authStrategy: new LocalAuth({
      clientId: undefined,
      dataPath: constants.sessionPath
    })
  });

  // WhatsApp auth
  client.on(Events.QR_RECEIVED, (qr: string) => {
    qrcode.generate(qr, { small: true }, (qrcode: string) => {
      cli.printQRCode(qrcode);
    });
  });

  // WhatsApp loading
  client.on(Events.LOADING_SCREEN, (percent) => {
    if (percent == '0') {
      cli.printLoading();
    }
  });

  // WhatsApp authenticated
  client.on(Events.AUTHENTICATED, () => {
    cli.printAuthenticated();
  });

  // WhatsApp authentication failure
  client.on(Events.AUTHENTICATION_FAILURE, () => {
    cli.printAuthenticationFailure();
  });

  // WhatsApp ready
  client.on(Events.READY, () => {
    // Print outro
    cli.printOutro();

    // Set bot ready timestamp
    botReadyTimestamp = new Date();
  });

  // WhatsApp message
  async function handleMessage(message: Message) {
    // Ignore if message is from status broadcast
    if (message.from == constants.statusBroadcast) return;

    // Prevent handling old messages
    if (message.timestamp != null) {
      const messageTimestamp = new Date(message.timestamp * 1000);
      let messageString = message.body;
      // If startTimestamp is null, the bot is not ready yet
      if (botReadyTimestamp == null) {
        cli.print(
          'Ignoring message because bot is not ready yet: ' + messageString
        );
        return;
      }

      // Ignore messages that are sent before the bot is started
      if (messageTimestamp < botReadyTimestamp) {
        cli.print('Ignoring old message: ' + messageString);
        return;
      }
    }

    await handleIncomingMessage(message);
  }

  client.on(Events.MESSAGE_RECEIVED, async (message: Message) => {
    await handleMessage(message);
  });

// Reply to own message
  client.on(Events.MESSAGE_CREATE, async (message: Message) => {

    // Ignore if it's not from me
    if (!message.fromMe) return;

    await handleMessage(message);
  });

  // WhatsApp initialization
  return client.initialize();
};

export { botReadyTimestamp, start };
