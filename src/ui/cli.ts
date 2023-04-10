import { intro, spinner, note, outro, text } from '@clack/prompts';
import * as color from 'picocolors';
import * as qrcode from 'qrcode-terminal';

const s = spinner();

export const print = (text: string) => {
  console.log(color.green('◇') + '  ' + text);
};

export const printIntro = () => {
  intro(color.bgCyan(color.white(' Whatsapp ChatGPT & DALL-E ')));
  note(
    "A Whatsapp bot that uses OpenAI's ChatGPT and DALL-E to generate text and images from a prompt."
  );
  s.start('Starting');
};

export const printQRCode = (qrString: string) => {
  s.stop('Client is ready!');

  note(qrString, 'QR as code');

  qrcode.generate(qrString, { small: true }, (qrcode: string) => {
    note(qrcode, 'Scan the QR code below to login to Whatsapp Web.');
  });

  qrcode.generate(qrString, { small: false }, (qrcode: string) => {
    note(qrcode, 'OR Scan the bigger QR code below to login to Whatsapp Web.');
  });

  s.start('Waiting for QR code to be scanned');
};

export const printLoading = () => {
  s.stop('Authenticated!');
  s.start('Logging in');
};

export const printAuthenticated = () => {
  s.stop('Session started!');
  s.start('Opening session');
};

export const printAuthenticationFailure = () => {
  s.stop('Authentication failed!');
};

export const printOutro = () => {
  s.stop('Loaded!');
  outro('Whatsapp ChatGPT & DALLE is ready to use.');
};
