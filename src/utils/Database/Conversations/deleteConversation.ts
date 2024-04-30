import { Conversation } from 'src/types';
import EasyIDB, { settings } from '../IDB';
import getMessagesByConversationId from '../Messages/getMessages';
import deleteMessage from '../Messages/deleteMessage';

export default async function deleteConversation(conversation: Conversation): Promise<void> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  console.log(conversation.id)
  
  const messages = await getMessagesByConversationId(conversation.id);
  for (const message of messages) {
    await deleteMessage(message)
  }
  
  const tx = db.db.transaction('conversations', 'readwrite');
  const store = tx.objectStore('conversations');
  store.delete(conversation.id);

  await tx.done;
}