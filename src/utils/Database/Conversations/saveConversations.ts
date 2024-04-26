import { Conversation } from "src/types";

import EasyIDB, { settings } from "../IDB";
import saveMessages from "../Messages/saveMessages";

export default async function saveConversations(conversations: Conversation[]): Promise<void> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  
  for (const conversation of conversations) {
    const tx = db.db.transaction('conversations', 'readwrite');
    const store = tx.objectStore('conversations');
    const formatted = {
      id: conversation.id,
      summary: conversation.summary,
      createdAt: conversation.createdAt,
    }
    store.put(formatted);

    await saveMessages(conversation.id, conversation.messages);
    await tx.done;
  }

}