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
	 * Сериализовать объект нейронной сети в JSON-строку
	 */
	public static serialize(nn: NeuralNetwork): string {
		const serializedLayers = nn.layers.map((l) => Layer.serialize(l));

		return JSON.stringify(serializedLayers);
	}

	/**
	 * Десериализовать объект нейронной сети из JSON-строки
	 */
	public static deserialize(jsonString: string): NeuralNetwork {
		const parsedLayers: Layer[] = JSON.parse(jsonString).map((l: any) => Layer.deserialize(l));

		return new NeuralNetwork(parsedLayers);
	}

	/**
	 * Constructor
	 */
	constructor(config: NeuralNetworkConfig | Layer[]) {
		// Если переданы уже сконфигурированные слои,
		// то принять их и выйти.
		if (Array.isArray(config)) {
			if (config.length < 2) {
				throw new Error('');
			}

			this.layers = [...config];

			return;
		}

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
	 * Опросить сеть
	 */
	public query(inputs: number[]): Matrix {
		const inputMatrix = Matrix.fromArray([inputs]).resize([inputs.length, 1]);

		return this.layers.reduce((input: Matrix, layer: Layer) => layer.calcOutputs(input), inputMatrix);
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

				const outputMatrix = this.layers.reduce((input: Matrix, layer: Layer) => layer.calcOutputs(input), inputMatrix);
				const errorMatrix = targetMatrix.subtract(outputMatrix);

				this.layers.reduceRight((error: Matrix, layer: Layer) => {
					return layer.calcErrors(error);
				}, errorMatrix);
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
