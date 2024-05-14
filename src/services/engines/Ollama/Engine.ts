import generateUUID from "src/composeables/generateUUID";
import { OpenEngine, ModelProps, OpenEngineProps } from "../types";
import OllamaModel from './Model'

export interface OllamaEngineI extends OpenEngine {
  type: 'ollama';
  createModel(model: ModelProps): OllamaModel;
}

export class OllamaEngine implements OllamaEngineI {
  readonly type = 'ollama';
  readonly isClosed = false;

  id: string;
  name: string;
  url: string;
  createdAt: number;

  constructor (props: OpenEngineProps) {
    this.id = props.id || generateUUID();
    this.name = props.name;
    this.url = props.url;
    this.createdAt = props.createdAt || Date.now();
  }

  createModel (model: ModelProps): OllamaModel {
    const newModel = new OllamaModel({
      ...model,
      engine: this,
    });

    return newModel
  }
}

export default OllamaEngine