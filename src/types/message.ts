import { MessageContent, MessageSendOptions } from 'whatsapp-web.js';

export enum MessageTypes {
  TEXT = 'chat',
  AUDIO = 'audio',
  VOICE = 'ptt',
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export interface Message {
  author?: string,
  /** Message content */
  body: string,
  /** Indicates if the message was a broadcast */
  broadcast: boolean,
  /** Indicates if the message is a Gif */
  isGif: boolean,
  /** Indicates if the message will disappear after it expires */
  isEphemeral: boolean,
  /** ID for the Chat that this message was sent to, except if the message was sent by the current user */
  from: string,
  /** Indicates if the message was sent by the current user */
  fromMe: boolean,
  /** Indicates if the message has media available for download */
  hasMedia: boolean,
  /** Indicates if the message was sent as a reply to another message */
  hasQuotedMsg: boolean,
  /** Indicates the duration of the message in seconds */
  duration: string,
  /** ID that represents the message */
  id: { id: string },
  /** Indicates if the message was forwarded */
  isForwarded: boolean,
  /** MediaKey that represents the sticker 'ID' */
  mediaKey?: string,
  /** Indicates the mentions in the message body. */
  mentionedIds: [],
  /** Unix timestamp for when the message was created */
  timestamp: number,
  /**
   * ID for who this message is for.
   * If the message is sent by the current user, it will be the Chat to which the message is being sent.
   * If the message is sent by another user, it will be the ID for the current user.
   */
  to: string,
  /** Message type */
  type: MessageTypes,
  /** Links included in the message. */
  links: Array<{
    link: string,
    isSuspicious: boolean
  }>,
  /** title */
  title?: string,
  /** description*/
  description?: string,
  /** Returns message in a raw format */
  rawData: object,
  // /**
  //  * Sends a message as a reply to this message.
  //  * If chatId is specified, it will be sent through the specified Chat.
  //  * If not, it will send the message in the same Chat as the original message was sent.
  //  */
  // reply: (content: MessageContent, chatId?: string, options?: MessageSendOptions) => Promise<Message>,
  /**
   * Custom value for forwarded and replied messages
   */
  attachedMessage?: Message
}
