import { Layer } from './layer';
import { isNumber } from '../utils';
import { sigmoid } from '../activators';
import { Activator, LayerConfig, LayerType, NeuralNetworkConfig } from '../types';

export class NeuralNetwork {
	// Коэффициент обучения по умолчанию
	private static readonly LR_DEFAULT: number = 0.3;
	// Момент по умолчанию
	private static readonly MOMENT_DEFAULT: number = 0;
	// Функция активации по умолчанию
	private static readonly ACTIVATOR_DEFAULT: Activator = sigmoid;

	// Слои нейронной сети
	private layers: Layer[];

	/**
	 * Constructor
	 */
	constructor(config: NeuralNetworkConfig) {
		if (!this.validateNeuronCounts(config.neuronCounts)) {
			const error = [
				'Length of neuronCounts option must be more or equal 2!',
				'And value of each item of this option must be more 0!'
			].join(' ');

			throw new Error(error);
		}

		this.initNeuralNetwork(config);
		console.log('LAYERS: ', this.layers);
	}

	/**
	 * Инициализировать нейронную сеть
	 */
	private initNeuralNetwork(config: NeuralNetworkConfig) {
		const {neuronCounts, learningRate, moment, activator} = config;
		this.layers = [];

		for (let i = 0; i < neuronCounts.length; ++i) {
			const type = i === 0
				? LayerType.INPUT
				: i === neuronCounts.length - 1
					? LayerType.OUTPUT
					: LayerType.HIDDEN;

			const layerConfig: LayerConfig = {
				type,
				layerSize: neuronCounts[i],
				prevLayerSize: i > 0 ? neuronCounts[i - 1] : undefined,
				learningRate: isNumber(learningRate) ? learningRate : NeuralNetwork.LR_DEFAULT,
				activator: typeof activator === 'function' ? activator : NeuralNetwork.ACTIVATOR_DEFAULT
			};

			this.layers.push(new Layer(layerConfig));
		}
	}

	/**
	 * Проверить, что все элементы массива числа больше 0 и его длина не меньше 2
	 */
	private validateNeuronCounts(neuronCounts: number[]): boolean {
		const condition = Boolean(neuronCounts)
			&& Array.isArray(neuronCounts)
			&& neuronCounts.length >= 2;

		if (!condition) {
			return false;
		}

		let allItemsIsCorrect = true;
		for (let i = 0; i < neuronCounts.length; ++i) {
			allItemsIsCorrect = allItemsIsCorrect
				&& isNumber(neuronCounts[i])
				&& neuronCounts[i] > 0;

			if (!allItemsIsCorrect) {
				break;
			}
		}

		return allItemsIsCorrect;
	}
}
