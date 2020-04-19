import { NdArray } from 'numjs';

export interface ForwardPropResult {
	hiddenOutputs: NdArray;
	finalOutputs: NdArray;
}
