import generateUUID from 'src/composeables/generateUUID';
import { Capabilities, ClosedModel, ModelProps, ModelSettings, SupportLevel } from '../../types';

import { OpenAIEngine } from '../Engine';

export interface OpenAIModel extends ClosedModel {
  engine: OpenAIEngine;
}

export type OpenAIModelProps = ModelProps & {
  engine: OpenAIEngine;
};

export default OpenAIModel;
