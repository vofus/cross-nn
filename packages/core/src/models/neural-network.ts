import { Layer } from './layer';
import { sigmoid } from '../activators';
import { isNumber, shuffle } from '../utils';
import { defaultTrainReporter } from '../reporters';
import { Activator, LayerConfig, LayerType, NeuralNetworkConfig, LearningGradAlgorithm, TrainItem, TrainReporter } from '../types';
import { Matrix } from '@cross-nn/matrix';

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
	 * Проверить, что все элементы массива числа больше 0 и его длина не меньше 2
	 */
	private static validateNeuronCounts(neuronCounts: number[]): boolean {
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

	/**
	 * Constructor
	 */
	constructor(config: NeuralNetworkConfig) {
		if (!NeuralNetwork.validateNeuronCounts(config.neuronCounts)) {
			const error = [
				'Length of neuronCounts option must be more or equal 2!',
				'And value of each item of this option must be more 0!'
			].join(' ');

			throw new Error(error);
		}

		this.initNeuralNetwork(config);
	}

	/**
	 * Обучение сети при помощи градиентных алгоритмов обучения
	 */
	public gradAlgorithmTrain(algorithmType: LearningGradAlgorithm, trainSet: TrainItem[], epochs: number, reporter: TrainReporter = defaultTrainReporter) {
		switch (algorithmType) {
			case LearningGradAlgorithm.BACK_PROP:
			case LearningGradAlgorithm.BACK_PROP_WITH_MOMENT:
				this.gradAlgorithmBackPropTrain(trainSet, epochs, reporter);
				break;
			default:
				break;
		}
	}

	/**
	 * Обучение сети при помощи градиентного алгоритма BACK_PROP / BACK_PROP_WITH_MOMENT
	 */
	private gradAlgorithmBackPropTrain(trainSet: TrainItem[], epochs: number, reporter: TrainReporter) {
		let epochCounter = 0;

		while (++epochCounter <= epochs) {
			const shuffled: TrainItem[] = shuffle(trainSet);
			let startDate = Date.now();
			let trainCounter = shuffled.length;

			while (--trainCounter >= 0) {
				const { inputs, targets } = shuffled[trainCounter];
				const inputMatrix = Matrix.fromArray([inputs]).resize([inputs.length, 1]);
				const targetMatrix = Matrix.fromArray([targets]).resize([targets.length, 1]);

				const outputs = this.layers.reduce((input: Matrix, layer: Layer) => layer.calcOutputs(input), inputMatrix);
				const errors = targetMatrix.subtract(outputs);

				this.layers.reduceRight((error: Matrix, layer: Layer) => layer.calcErrors(errors), errors);
			}

			reporter({
				epochNumber: epochCounter,
				epochTime: Date.now() - startDate
			});
		}
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
				moment: Boolean(moment) ? moment : NeuralNetwork.MOMENT_DEFAULT,
				learningRate: isNumber(learningRate) ? learningRate : NeuralNetwork.LR_DEFAULT,
				activator: typeof activator === 'function' ? activator : NeuralNetwork.ACTIVATOR_DEFAULT
			};

			this.layers.push(new Layer(layerConfig));
		}
	}
}
