import Message from 'src/utils/App/Message';
import EasyIDB, { settings } from '../IDB';
import { Database__Message } from 'src/types';

export type MessageQuerySubArrayByCount = {
  from: number;
  count: number;
};

export type MessageQuerySubArrayByDestination = {
  from: number;
  to: number;
};

export type MessageQuerySubArray = MessageQuerySubArrayByCount | MessageQuerySubArrayByDestination;

export type MessageQueryOptions = {
  limit?: number;
  subArrays?: MessageQuerySubArray[];
};

const getKeysSubArray = (keys: IDBValidKey[], subArray: MessageQuerySubArray): IDBValidKey[] => {
  if ('count' in subArray) {
    const from = Math.max(
      Math.min(subArray.from < 0 ? keys.length + subArray.from : subArray.from, keys.length),
      0
    );
    const to = Math.max(Math.min(from + subArray.count, keys.length), 0);

    const subKeys = keys.slice(from, to);
    return subKeys;
  } else {
    const from = Math.max(
      Math.min(subArray.from < 0 ? keys.length + subArray.from : subArray.from, keys.length),
      0
    );
    let to = Math.max(Math.min(subArray.to < 0 ? keys.length + subArray.to : subArray.to), 0);

    if (subArray.to < 0) to += 1;
    const subKeys = keys.slice(from, to);
    return subKeys;
  }
};

// const testGetKeysSubArray = () => {
//   const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

//   const subArrayByCount1 = getKeysSubArray(keys, { from: 0, count: 3 })
//   console.log(subArrayByCount1)
//   const subArrayByCount2 = getKeysSubArray(keys, { from: -3, count: 3 })
//   console.log(subArrayByCount2)
//   const subArrayByDestination1 = getKeysSubArray(keys, { from: 0, to: 3 })
//   console.log(subArrayByDestination1)
//   const subArrayByDestination2 = getKeysSubArray(keys, { from: -3, to: 2 })
//   console.log(subArrayByDestination2)

//   const subArrayByCount3 = getKeysSubArray(keys, { from: -1, count: 2 })
//   console.log(subArrayByCount3)

// }
// testGetKeysSubArray()

export default async function getMessagesByConversationId(
  conversationId: string,
  options?: MessageQueryOptions
): Promise<Message[]> {
  const db = await EasyIDB.getDB(settings.dbName, settings.dbVersion);

  if (!conversationId) return [];

  const tx = db.db.transaction('messages', 'readonly');
  const store = tx.objectStore('messages');

  let messages: Database__Message[];

  // Get the first message if limit is set. IndexedDB returns the messages from newest to oldest, so we have to get the last message from all the keys
  // If the result was given from oldest to newest, we could use:
  // `store.index('conversationId').getAllKeys(conversationId, limit)`
  const { subArrays } = options || {};
  if (subArrays) {
    const keys = await store.index('conversationId').getAllKeys(conversationId);
    const messageKeys = subArrays
      .map((sub) => {
        return getKeysSubArray(keys, sub);
      })
      .flat();

    messages = await Promise.all(
      messageKeys.map(async (keys) => {
        const message: Database__Message = await store.get(keys);
        return message;
      })
    );
  } else {
    messages = await store.index('conversationId').getAll(conversationId);
  }

  await tx.done;

  const formattedMessages = messages.map((message) => {
    const messageProps = {
      id: message.id,
      author: message.author,
      content: { raw: message.content || '' },
      modelId: message.modelId,
      createdAt: message.createdAt,
      images: message.images || [],
    };
    return new Message(messageProps);
  });

  return formattedMessages;
}
