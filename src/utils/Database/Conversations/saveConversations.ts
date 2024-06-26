import Conversation from 'src/utils/App/Conversation';
import EasyIDB, { settings } from '../IDB';
import saveMessages from '../Messages/saveMessages';

export default async function saveConversations(conversations: Conversation[]): Promise<void> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  // console.log('Saving conversations')
  for (const conversation of conversations) {
    // console.log(conversation)
    const tx = db.db.transaction('conversations', 'readwrite');
    const store = tx.objectStore('conversations');
    const formatted = conversation.toDatabaseConversation();
    store.put(formatted);

    await saveMessages(conversation.id, conversation.messages);
    await tx.done;
  }
}
