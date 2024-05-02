import Message from 'src/utils/App/Message'
import generateUUID from './generateUUID'

export default function useMessageCreator () {
  const createUserMessage = (content: string) => {
    return new Message({
      id: generateUUID(),
      content: { raw: content },
      author: 'user',
      createdAt: Date.now()
    })
  }

  const createAssisstantMessage = (content: string, model: string) => {
    return new Message({
      id: generateUUID(),
      content: { raw: content },
      author: 'assistant',
      modelId: model
    })
  }

  return {
    createUserMessage,
    createAssisstantMessage
  }
}