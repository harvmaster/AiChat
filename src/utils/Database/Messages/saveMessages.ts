import Message from 'src/utils/App/Message';
import EasyIDB, { settings } from '../IDB';

export default async function saveMessages(conversationId: string, messages: Message[]): Promise<void> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  const tx = db.db.transaction('messages', 'readwrite');
  const store = tx.objectStore('messages');

  for (const message of messages) {
    const formatted = {
      ...message.toDatabaseMessage(),
      conversationId: conversationId,
    }

    store.put(formatted);
  }

  await tx.done;
}