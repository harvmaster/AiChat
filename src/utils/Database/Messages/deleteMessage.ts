import { Message } from "src/types";
import EasyIDB, { settings } from "../IDB";

export default async function deleteMessage(message: Message): Promise<void> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  const tx = db.db.transaction('messages', 'readwrite');
  const store = tx.objectStore('messages');

  store.delete(message.id);

  await tx.done;
}