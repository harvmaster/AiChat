import Conversation from "src/utils/App/Conversation";

import { app } from "boot/app";

import getConversationSummary from "./getConversationSummary";
import useMessageCreator from "./useMessageCreator";
import useAIChat from "./useAIChat";

const useChatInput = async (conversation: Conversation, content: string) => {
  const { loading, getChatResponse } = useAIChat();

  const addChatMessage = async (conversation: Conversation, content: string) => {
  
    const { createUserMessage, createAssisstantMessage } = useMessageCreator();

    const userMessage = createUserMessage(content);
    conversation.messages.push(userMessage);

    const model = app.settings.value.selectedModel;
    if (!model) throw new Error("No model selected");

    const assistantMessage = createAssisstantMessage('', model.id);
    conversation.messages.push(assistantMessage);

    const response = await getChatResponse(model, conversation.getChatHistory(), response => {
      assistantMessage.content.value.raw += response.message.content;
    });
    assistantMessage.content.value.raw = response.message.content;

    await getConversationSummary(conversation);
  }

  return {
    loading,
    addChatMessage
  }
}

export default useChatInput;