// import { Conversation } from 'src/types';
import Conversation from '../../App/Conversation';
import EasyIDB, { settings } from '../IDB';
import getMessagesByConversationId from '../Messages/getMessages';

type GetConversationsOptions = {
  getMessages?: boolean;
}

export default async function getConversations(options?: GetConversationsOptions): Promise<Conversation[]> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  const tx = db.db.transaction('conversations', 'readonly');
  const store = tx.objectStore('conversations');

  const conversations = await store.getAll();

  await tx.done;

  // const formattedConversations = conversations.map((conversation) => {
  //   return { ...conversation, messages: [] }
  // })
  const formattedConversations = conversations.map((conversation) => {
    const conversationProps = { ...conversation, messages: [] }
    return new Conversation(conversationProps)
  })

  if (options?.getMessages) {
    await Promise.all(formattedConversations.map(async (conversation) => conversation.loadMessages()))
  }

  return formattedConversations;
}