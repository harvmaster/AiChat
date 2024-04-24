import Database from './Database'
import stores from './stores'
import BaseStore from './stores/baseStore'
import { BaseStoreI } from './types'
import { ConversationStore, MessageStore } from './stores'; // Import ConversationStore from stores module

let database: Database | null = null

const getDatabase = async () => {
  if (database) return database

  const db = new Database()

  // Initialise stores
  const initialisedStores: [ConversationStore, MessageStore] = [
    new ConversationStore(db), // Use ConversationStore from stores module
    new MessageStore(db)
  ]

  await db.init(initialisedStores)

  database = db
  return db
}

export default getDatabase