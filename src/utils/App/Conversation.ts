import { ChatHistory } from "src/services/models";
import Message from "./Message";
import getMessagesByConversationId from "../Database/Messages/getMessages";

export type ConversationProps = {
  id: string;
  summary: string;

  messages: Message[];
  createdAt?: number;
}

export type Database__Conversation = {
  id: string;
  summary: string;
  createdAt: number;
}

export class Conversation {
  public id: string;
  public summary: string;

  public messages: Message[];
  public createdAt: number;

  constructor (props: ConversationProps) {
    this.id = props.id;
    this.summary = props.summary;
    this.messages = props.messages;
    this.createdAt = props.createdAt || Date.now();
  }

  public getChatHistory (): ChatHistory {
    return this.messages.map(message => message.toChatMessage());
  }

  public toDatabaseConversation (): Database__Conversation {
    return {
      id: this.id,
      summary: this.summary,
      createdAt: this.createdAt
    }
  }

  public async loadMessages (): Promise<void> {
    this.messages = await getMessagesByConversationId(this.id);
  }
}

export default Conversation;