import { Message } from 'src/types';
import EasyIDB, { settings } from '../IDB';
import getHighlightedChunks from 'src/utils/HighlightMessage';

export default async function getMessagesByConversationId (conversationId: string): Promise<Message[]> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  const tx = db.db.transaction('messages', 'readonly');
  const store = tx.objectStore('messages');

  if (!conversationId) return []

  const messages = await store.index('conversationId').getAll(conversationId);

  await tx.done;

  const formattedMessagesPromises = messages.map(async (message) => {
    return {
      id: message.id,
      author: message.author,
      modelId: message.modelId,
      createdAt: message.createdAt,

      content: await getHighlightedChunks(message.content)
    }
  })

  const formattedMessages = await Promise.all(formattedMessagesPromises);

  return formattedMessages;
}