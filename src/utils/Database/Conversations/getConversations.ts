import { Conversation } from 'src/types';
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

  const formattedConversations = conversations.map((conversation) => {
    return { ...conversation, messages: [] }
  })

  if (options?.getMessages) {
    const messagesPromises = formattedConversations.map(async (conversation) => {
      const messages = await getMessagesByConversationId(conversation.id);
      return { ...conversation, messages };
    });

    const conversationsWithMessages = await Promise.all(messagesPromises);

    return conversationsWithMessages;
  }

  return formattedConversations;
}