import generateUUID from 'src/composeables/generateUUID';
import { Capabilities, ClosedModel, ModelProps, ModelSettings, SupportLevel } from '../../types';

import { GroqEngine } from '../Engine';

export interface GroqModel extends ClosedModel {
  engine: GroqEngine;
}

export type GroqModelProps = ModelProps & {
  engine: GroqEngine;
};

export default GroqModel;
