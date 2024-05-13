import Message from 'src/utils/App/Message';
import EasyIDB, { settings } from '../IDB';
import { Database__Message } from 'src/types';

export type MessageQuerySubArray = {
  from: number;
  to: number;
}

export type MessageQueryOptions = {
  limit?: number;
  subArrays?: MessageQuerySubArray[];
}

export default async function getMessagesByConversationId (conversationId: string, options?: MessageQueryOptions): Promise<Message[]> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  if (!conversationId) return []

  const tx = db.db.transaction('messages', 'readonly');
  const store = tx.objectStore('messages');

  let messages: Database__Message[];

  // Get the first message if limit is set. IndexedDB returns the messages from newest to oldest, so we have to get the last message from all the keys
  // If the result was given from oldest to newest, we could use:
  // `store.index('conversationId').getAllKeys(conversationId, limit)`
  const { limit, subArrays } = options || {}
  // if (options) console.log(options)
  if (subArrays) {
    const keys = await store.index('conversationId').getAllKeys(conversationId);
    const messageKeys = subArrays.map(sub => {
      const from = Math.max(Math.min(sub.from < 0 ? keys.length + sub.from : sub.from, keys.length), 0);
      const to = Math.max(Math.min(sub.to < 0 ? keys.length + sub.to : sub.to), 0);

      console.log(from, to, keys.length, keys.slice(from, to))

      const subKeys = keys.slice(from, to);
      return subKeys
    }).flat()

    messages = await Promise.all(messageKeys.map(async keys => {
      const message = await store.get(keys);
      return message
    }))
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