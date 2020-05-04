import { LayerType } from './layer-type.enum';
import { Activator } from './activator.interface';

export interface LayerConfig {
	type: LayerType;
	layerSize: number;
	learningRate: number;
	moment?: number;
	prevLayerSize?: number;
	activator?: Activator;
}
