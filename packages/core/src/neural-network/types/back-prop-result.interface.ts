import { NdArray } from 'numjs';

export interface BackPropResult {
	deltaWeightsHO: NdArray;
	deltaWeightsIH: NdArray;
	weightsHO: NdArray;
	weightsIH: NdArray;
}
