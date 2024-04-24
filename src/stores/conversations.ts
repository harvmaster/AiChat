import { defineStore } from 'pinia';
import { Conversation, Message } from '../utils/types';
import getDatabase from 'src/utils/IndexedDB';

export const useConversationStore = defineStore('conversation', {
  state: () => ({
    conversations: [] as Conversation[],
  }),
  getters: {
    getConversationById: (state) => (id: string) => {
      return state.conversations.find(conversation => conversation.id === id)
    },
    getMessagesByConversationId: (state) => (id: string) => {
      const conversation = state.conversations.find(conversation => conversation.id === id)
      return conversation?.messages || []
    }
  },
  actions: {
    async readFromDb() {
      const db = await getDatabase()
      const conversations = await db.stores?.conversations.find({}) || []

      this.conversations = await Promise.all(conversations.map(async (conversation) => {
        return {
          ...conversation,
          messages: await db.stores?.messages.find({ conversationId: conversation.id }) || []
        }
      }))

      this.conversations.forEach(conversation => {
        if (conversation.messages.length === 0) {
          this.deleteConversation(conversation.id)
        }
      })
    },
    async addConversation(conversation: Conversation) {
      console.log('adding conversation', conversation)
      const db = await getDatabase()

      const messages = conversation.messages.map((message) => {
        return {
          id: message.id,
          author: message.author,
          content: message.content,
          timestamp: message.timestamp,
          conversationId: conversation.id
        }
      })

      const formattedConversation = {
        id: conversation.id,
        summary: conversation.summary
      }

      console.log('creating Conversation', formattedConversation)

      const newConversation = await db.stores?.conversations.create(formattedConversation).then(conversation => {
        if (Array.isArray(conversation)) return conversation[0]
        return { id: conversation.id, summary: conversation.summary }
      })
      const newMessages = await db.stores?.messages.create(messages).then(messages => {
        if (!Array.isArray(messages)) return [{ id: messages.id, author: messages.author, content: messages.content, timestamp: messages.timestamp }]
        return messages.map(message => ({ id: message.id, author: message.author, content: message.content, timestamp: message.timestamp }))
      }) || []

      this.conversations.push({
        id: newConversation?.id || '',
        summary: newConversation?.summary || '',
        messages: newMessages
      })
    },
    async addMessage(conversationId: string, message: Message) {
      const db = await getDatabase()

      console.log('adding message', message, 'to conversation', conversationId)

      const formattedMessage = {
        id: message.id,
        author: message.author,
        content: message.content,
        timestamp: message.timestamp,
        conversationId: conversationId
      }

      console.log('creating Message', formattedMessage)

      const newMessage = await db.stores?.messages.create(formattedMessage).then(message => {
        if (Array.isArray(message)) return { id: message[0].id, author: message[0].author, content: message[0].content, timestamp: message[0].timestamp }
        return { id: message.id, author: message.author, content: message.content, timestamp: message.timestamp }
      })

      console.log('new message', newMessage)

      if (!newMessage) return

      const conversationIndex = this.conversations.findIndex(conversation => conversation.id == conversationId)
      if (conversationIndex === -1) return

      console.log('adding message to conversation', conversationId, 'at index', conversationIndex)

      this.conversations[conversationIndex].messages.push(newMessage)

      this.readFromDb()
    },
    async deleteMessage (conversationId: string, messageId: string) {
      const db = await getDatabase()
      const conversationIndex = this.conversations.findIndex(conversation => conversation.id == conversationId)
      if (conversationIndex === -1) return

      const messageIndex = this.conversations[conversationIndex].messages.findIndex(message => message.id == messageId)
      if (messageIndex === -1) return

      await db.stores?.messages.delete({ id: messageId })

      this.conversations[conversationIndex].messages.splice(messageIndex, 1)
      this.readFromDb()
    },
    async deleteConversation (conversationId: string) {
      const db = await getDatabase()
      const conversationIndex = this.conversations.findIndex(conversation => conversation.id == conversationId)
      if (conversationIndex === -1) return

      await db.stores?.conversations.delete({ id: conversationId })

      this.conversations.splice(conversationIndex, 1)
      this.readFromDb()
    },
    async updateConversation (conversationId: string, newSummary: string) {
      const db = await getDatabase()
      const conversationIndex = this.conversations.findIndex(conversation => conversation.id == conversationId)
      if (conversationIndex === -1) return

      await db.stores?.conversations.findAndUpdate({ id: conversationId }, { summary: newSummary })

      this.conversations[conversationIndex].summary = newSummary
      this.readFromDb()
    }
  },
});
