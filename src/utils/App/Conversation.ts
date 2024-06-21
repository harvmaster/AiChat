import { ChatHistory, Model } from 'src/services/models';
import Message from './Message';
import getMessagesByConversationId, { MessageQueryOptions } from '../Database/Messages/getMessages';
import {
  ConversationProps,
  ConversationI,
  Database__Conversation,
  UserMessageInput,
} from 'src/types';
import generateUUID from 'src/composeables/generateUUID';

export class Conversation implements ConversationI {
  public id: string;
  public summary: string;

  public messages: Message[];
  public createdAt: number;

  constructor(props: ConversationProps) {
    this.id = props.id;
    this.summary = props.summary;
    this.messages = props.messages;
    this.createdAt = props.createdAt || Date.now();
  }

  public getChatHistory(): ChatHistory {
    return this.messages.map((message) => message.toChatMessage());
  }

  public toDatabaseConversation(): Database__Conversation {
    return {
      id: this.id,
      summary: this.summary,
      createdAt: this.createdAt,
    };
  }

  // Keep first and last message so we can still have a summary and last message timestamp
  public async unloadMessages(): Promise<void> {
    this.messages = [this.messages[0], this.messages[this.messages.length - 1]];
  }

  public async loadMessages(options?: MessageQueryOptions): Promise<void> {
    const messages = await getMessagesByConversationId(this.id, options);
    this.messages = messages.sort((a, b) => a.createdAt - b.createdAt);
  }

  public addUserMessage({ content, images }: UserMessageInput): void {
    const message = new Message({
      id: generateUUID(),
      author: 'user',
      content: { raw: content },
      images,
    });

    this.messages.push(message);
  }

  public async addAssistantMessage(model: Model): Promise<Message> {
    const assistantMessage = new Message({
      id: generateUUID(),
      author: 'assistant',
      content: { raw: '' },
      createdAt: Date.now() + 1, // Had issues where messages could not be sorted by date as they had the same time as the user message. This caused user message to come after assistant message
    });

    this.messages.push(assistantMessage);
    await assistantMessage.generateAssistantResponse(model, this.getChatHistory());

    return assistantMessage;
  }

  public async getConversationSummary(model: Model): Promise<string> {
    if (this.messages.length === 0) throw new Error('No messages yet');
    if (this.summary) return this.summary;

    const formattedMessages = this.getChatHistory();
    const summaryPrompt: ChatHistory = [
      {
        role: 'system',
        content: 'Summarise this conversation into 5 words or less',
      },
      {
        role: 'user',
        content: formattedMessages.map((m) => m.content).join(' '),
      },
    ];

    const response = await model.sendChat({ messages: summaryPrompt }).response;
    this.summary = response.message.content;

    return this.summary;
  }
}

export default Conversation;
