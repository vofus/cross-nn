import { Activator } from './activator.interface';
import { Layer } from '../models';

export interface NeuralNetworkConfig {
	// Количество нейронов в каждом слое
	// Требуется минимум 2 слоя - входной и выходной
	neuronCounts: number[];
	// Коэффициент обучения
	learningRate?: number;
	// Момент
	moment?: number;
	// Функция активации
	activator?: Activator;
}
