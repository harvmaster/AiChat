import Conversation from 'src/utils/App/Conversation';

import { app } from 'boot/app';

import getConversationSummary from './getConversationSummary';
import useMessageCreator from './useMessageCreator';
import useAIChat from './useAIChat';
import useGenerationList from './useGenerationList';
import { ChatCompletionResponse, ChatHistory } from 'src/services/models';
import Message from 'src/utils/App/Message';

const useChatInput = () => {
  const { loading, getChatResponse } = useAIChat();
  const { createUserMessage, createAssisstantMessage } = useMessageCreator();
  const { addGeneratingItem, removeGeneratingItem } = useGenerationList();

  const addUserMessage = async (conversation: Conversation, content: string) => {
    const userMessage = createUserMessage(content);
    conversation.messages.push(userMessage);
  }

  const addAssisstantMessage = async (conversation: Conversation) => {
    const chatHistory = conversation.getChatHistory();
    const assistantMessage = createAssisstantMessage('', '');
    conversation.messages.push(assistantMessage);

    await generateAssisstantResponse(conversation, assistantMessage, chatHistory);
    await getConversationSummary(conversation);
  }

  const generateAssisstantResponse = async (conversation: Conversation, assistantMessage: Message, chatHistory?: ChatHistory) => {
    const model = app.settings.value.selectedModel;
    if (!model) throw new Error('No model selected');

    assistantMessage.modelId = model.id;

    let shouldUpateMessage = true
    const onToken = (message: ChatCompletionResponse) => {
      if (shouldUpateMessage) assistantMessage.content.value.raw += message.message.content;
    }

    const cancelGenerating = () => {
      shouldUpateMessage = false;
      removeGeneratingItem(conversation.id, assistantMessage.id);
      loading.value = false
    }

    if (!chatHistory) chatHistory = conversation.getChatHistory();
    if (assistantMessage.content.value.raw.length) {
      addContinuePrompt(chatHistory);
    }
    
    addGeneratingItem(conversation.id, assistantMessage.id, cancelGenerating);
    const response = await getChatResponse(model, chatHistory, onToken);
    // if (shouldUpateMessage) assistantMessage.content.value.raw = response.message.content;
    removeGeneratingItem(conversation.id, assistantMessage.id);
  }

  const addContinuePrompt = (chatHistory: ChatHistory) => {
    chatHistory.push({
      role: 'user',
      content: 'Continue the previous message, Adding a space or line break to the start if needed.'
    });
  }

  return {
    loading,
    addUserMessage,
    addAssisstantMessage,
    generateAssisstantResponse
  }
}

export default useChatInput;