import Message from 'src/utils/App/Message';
import EasyIDB, { settings } from '../IDB';
import { Database__Message } from 'src/types';

export default async function getMessagesByConversationId (conversationId: string, limit?: number): Promise<Message[]> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  if (!conversationId) return []

  const tx = db.db.transaction('messages', 'readonly');
  const store = tx.objectStore('messages');

  let messages: Database__Message[];

  // Get the first message if limit is set. IndexedDB returns the messages from newest to oldest, so we have to get the last message from all the keys
  // If the result was given from oldest to newest, we could use:
  // `store.index('conversationId').getAllKeys(conversationId, limit)`
  if (limit !== undefined) {
    const keys = await store.index('conversationId').getAllKeys(conversationId);
    const firstMessage = await store.get(keys.at(-1) || 0);
    messages = [firstMessage]
  } else {
    messages = await store.index('conversationId').getAll(conversationId);
  }

  await tx.done;

  const formattedMessages = messages.map(message => {
    const messageProps = {
      id: message.id,
      author: message.author,
      content: { raw: message.content || '' },
      modelId: message.modelId,
      createdAt: message.createdAt,
      images: message.images || []
    }
    return new Message(messageProps)
  }) 

  return formattedMessages;
}