import Message from 'src/utils/App/Message';
import EasyIDB, { settings } from '../IDB';

export default async function getMessagesByConversationId (conversationId: string): Promise<Message[]> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  const tx = db.db.transaction('messages', 'readonly');
  const store = tx.objectStore('messages');

  if (!conversationId) return []

  const messages = await store.index('conversationId').getAll(conversationId);

  await tx.done;

  const formattedMessages = messages.map(message => {
    const messageProps = {
      id: message.id,
      author: message.author,
      content: { raw: message.content || '' },
      modelId: message.modelId,
      createdAt: message.createdAt,
    }
    return new Message(messageProps)
  }) 

  return formattedMessages;
}