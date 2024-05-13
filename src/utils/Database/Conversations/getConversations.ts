// import { Conversation } from 'src/types';
import Conversation from '../../App/Conversation';
import EasyIDB, { settings } from '../IDB';

type GetConversationsOptions = {
  getMessages?: boolean;
}

export default async function getConversations(options?: GetConversationsOptions): Promise<Conversation[]> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  const tx = db.db.transaction('conversations', 'readonly');
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

  // We need at least one message if the summary isnt set, so lets get that if we need it
  formattedConversations.forEach(converstaion => {
    if (!converstaion.summary) converstaion.loadMessages(1)
  })

  return formattedConversations;
}