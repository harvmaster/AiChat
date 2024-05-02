import { app } from 'boot/app'
import useAIChat from './useAIChat'
import Conversation from 'src/utils/App/Conversation'
import { ChatHistory } from 'src/services/models'

const createSummaryPrompt = (conversation: Conversation): ChatHistory => {
  const formattedMessages = conversation.getChatHistory()
  return [
    {
      role: 'system',
      content: 'Summarise this conversation into 5 words or less'
    },
    {
      role: 'user',
      content: formattedMessages.map(m => m.content).join(' ')
    }
  ]
}

export default async function getConversationSummary(conversation: Conversation) {
  const { getChatResponse } = useAIChat()

  if (conversation.messages.length === 0) {
    return 'No messages yet'
  }
  if (conversation.summary) return conversation.summary

  const model = app.settings.value.selectedModel
  if (!model) throw new Error('No model selected')

  const summaryPrompt = createSummaryPrompt(conversation)

  const summary = await getChatResponse(model, summaryPrompt)
  conversation.summary = summary.message.content

  return conversation.summary
}