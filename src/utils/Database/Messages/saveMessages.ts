import { Message } from 'src/types';
import EasyIDB, { settings } from '../IDB';

export default async function saveMessages(conversationId: string, messages: Message[]): Promise<void> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  const tx = db.db.transaction('messages', 'readwrite');
  const store = tx.objectStore('messages');

  for (const message of messages) {
    const formatted = {
      id: message.id,
      author: message.author,
      content: message.content.raw,
      modelId: message.modelId,

      createdAt: message.createdAt,
      conversationId: conversationId,
    }

    store.put(formatted);
  }

  await tx.done;
}