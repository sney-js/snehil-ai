import * as qrcode from 'qrcode-terminal';
import {
  Client,
  Events,
  LocalAuth,
  Message,
  MessageMedia
} from 'whatsapp-web.js';

// Constants
import constants from './constants';

// CLI
import * as cli from '../../ui/cli';
import { CompanionAI } from '../../providers/companionAI';

type RequestOptions = {
  requestedConfigChange: boolean;
  requestedReset: boolean;
  requestedChatAI: boolean;
  requestedImageAI: boolean;
  any: boolean;
};

export class WhatsAppBot extends CompanionAI {
  botReadyTimestamp: Date | null = null;

  override async initialise() {
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
      this.botReadyTimestamp = new Date();
    });

    // WhatsApp message
    const handleMessage = async (message: Message) => {
      // Ignore if message is from status broadcast
      if (message.from == constants.statusBroadcast) return;

      // Prevent handling old messages
      if (message.timestamp != null) {
        const messageTimestamp = new Date(message.timestamp * 1000);
        let messageString = message.body;
        // If startTimestamp is null, the bot is not ready yet
        if (this.botReadyTimestamp == null) {
          cli.print(
            'Ignoring message because bot is not ready yet: ' + messageString
          );
          return;
        }

        // Ignore messages that are sent before the bot is started
        if (messageTimestamp < this.botReadyTimestamp) {
          cli.print('Ignoring old message: ' + messageString);
          return;
        }
      }

      await this.handleIncomingMessage(message);
    };

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
    await client.initialize();
  }

  private getPrompt(body: string, requestOptions: RequestOptions) {
    const config = this.generalConfig;
    if (requestOptions.requestedChatAI) {
      return body.substring(config.gptPrefix.length + 1);
    }
    if (requestOptions.requestedImageAI) {
      return body.substring(config.dallePrefix.length + 1);
    }
    if (requestOptions.requestedConfigChange) {
      return body.substring(config.aiConfigPrefix.length + 1);
    }
    if (requestOptions.requestedReset) {
      return body.substring(config.resetPrefix.length + 1);
    }
    return body;
  }

  private isCompanionRelevantMessage(message): RequestOptions {
    const startsWithIgnoreCase = (str, prefix) =>
      str.toLowerCase().startsWith(prefix.toLowerCase());

    const config = this.generalConfig;

    const values = {
      requestedChatAI: startsWithIgnoreCase(message, config.gptPrefix),
      requestedImageAI: startsWithIgnoreCase(message, config.dallePrefix),
      requestedConfigChange: startsWithIgnoreCase(
        message,
        config.aiConfigPrefix
      ),
      requestedReset: startsWithIgnoreCase(message, config.resetPrefix),
      any: false
    };
    values.any =
      values.requestedChatAI ||
      values.requestedImageAI ||
      values.requestedConfigChange ||
      values.requestedReset;
    return values;
  }

  async handleIncomingMessage(message: Message): Promise<void> {
    const { body, from, fromMe, hasQuotedMsg, to } = message;

    const requestOptions = this.isCompanionRelevantMessage(body);
    // no proessing needed. Ignore message.
    if (!requestOptions.any) return;

    let prompt = this.getPrompt(body, requestOptions);

    // Ignore groupchats if disabled
    let isGroupChat = (await message.getChat())?.isGroup;
    if (isGroupChat && !this.generalConfig.groupchatsEnabled) return;

    if (hasQuotedMsg) {
      const repliedMessage: Message = await message.getQuotedMessage();
      prompt += `----\n${repliedMessage.body}`;
    }

    if (requestOptions.requestedReset) {
      cli.print(`[RESET] Received prompt from ${from}: ${prompt}`);
      await this.handleRequestResetConversation(from).then((res) =>
        message.reply(res)
      );
      return;
    }

    if (requestOptions.requestedConfigChange) {
      console.log(`[AI-Config] Received prompt from ${from}: ${prompt}`);
      await this.handleRequestAdmin(prompt).then(() =>
        message.reply('Config set!')
      );
      return;
    }

    if (requestOptions.requestedChatAI) {
      cli.print(`[GPT] Received prompt from ${from}: ${prompt}`);
      await this.handleRequestChatbot(prompt, from).then((res) =>
        message.reply(res)
      );
      return;
    }

    if (requestOptions.requestedImageAI) {
      const start = Date.now();
      cli.print(`[DALL-E] Received prompt from ${from}: ${prompt}`);
      await this.handleRequestImageAI(prompt)
        .then((base64) => {
          const image = new MessageMedia('image/jpeg', base64, 'image.jpg');

          const end = Date.now() - start;
          cli.print(
            `[DALL-E] Answer to ${from} | OpenAI request took ${end}ms`
          );

          message.reply(image);
        })
        .catch((err) => {
          message.reply('An error happened: ' + err.message);
        });
      return;
    }
  }
}
