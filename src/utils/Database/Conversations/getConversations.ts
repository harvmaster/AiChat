// import { Conversation } from 'src/types';
import Conversation from '../../App/Conversation';
import EasyIDB, { settings } from '../IDB';

type GetConversationsOptions = {
  getMessages?: boolean;
}

export default async function getConversations(options?: GetConversationsOptions): Promise<Conversation[]> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  const tx = db.db.transaction('conversations', 'readwrite');
  const store = tx.objectStore('conversations');

  const conversations = await store.getAll();

  await tx.done;

  const formattedConversations = conversations.map((conversation) => {
    const conversationProps = { ...conversation, messages: [] }
    return new Conversation(conversationProps)
  })

  if (options?.getMessages) {
    await Promise.all(formattedConversations.map(async (conversation) => conversation.loadMessages()))
  }

  // We need at least first and last message if the summary isnt set, so lets get that if we need it. Last message is needed to know when the conversation was last updated
  // Kind of want to update the input to be from and count. So you define the length of the outputted array.
  await Promise.all(formattedConversations.map(converstaion => {
    return converstaion.loadMessages({ subArrays: [
      {
        from: 0,
        count: 1
      },
      {
        from: -1,
        count: 1
      }
    ]})
  }))

  return formattedConversations;
}