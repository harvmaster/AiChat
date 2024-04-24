import BaseStore from "./baseStore";

export type Conversation = {
  id: string;
  summary: string;
}

export class ConversationStore extends BaseStore<Conversation> {
  constructor(dbClient: any) {
    super(dbClient, 'conversations', { defaults: { index: 'id' } }, ConversationStore.schema);
  }

  static schema = {
    name: 'conversations',
    keyPath: 'id',
    autoIncrement: false,
    indices: [
      { name: 'id', keyPath: 'id', options: { unique: true } },
    ],
  };
}

export default ConversationStore