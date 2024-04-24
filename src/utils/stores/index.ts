import ConversationStore from './ConversationStore';
import MessageStore from './MessageStore';

export const stores = [
  ConversationStore,
  MessageStore,
]

export { default as ConversationStore } from './ConversationStore'
export { default as MessageStore } from './MessageStore'

export default stores