import BaseStore from "./baseStore";

export type Message = {
  id: string;
  author: string;
  conversationId: string;
  content: string;
  timestamp: number;
}

export class MessageStore extends BaseStore<Message> {
  constructor(dbClient: any) {
    super(dbClient, 'messages', { defaults: { index: 'id' } }, MessageStore.schema);
  }

  static schema = {
    name: 'messages',
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'id', keyPath: 'id', options: { unique: true } },
      { name: 'conversationId', keyPath: 'conversationId', options: { unique: false } },
    ],
  };
}

export default MessageStore