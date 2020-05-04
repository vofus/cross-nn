import { Matrix } from '@cross-nn/matrix';
import { isNumber } from '../utils';
import { Activator, LayerConfig, LayerType } from '../types';

export class Layer {
	// Тип слоя
	private readonly TYPE: LayerType;
	// Коэффициент обучения
	private readonly LR: number;
	// Момент
	private readonly MOMENT: number;
	// Функция активации,
	// по умолчанию возвращает значение принимаемого аргумента
	private readonly activator: Activator;
	// Весовые коэффициенты между предыдущим и текущим слоями
	// Для входного слоя эта матрица отсутствует
	private weights: Matrix;
	// Предыдущие изменения весовых коэффициентов
	private prevDeltaWeights: Matrix;
	// Закэшировать входящие и исходящие сигналы при прямом проходе,
	// для того чтобы при обратном проходе рассчитать корректировку весовых коэффициентов
	private inputs: Matrix;
	private outputs: Matrix;

	/**
	 * Инициализировать матрицу весовых коэффициентов
	 */
	private static initWeight(rows: number, cols: number): Matrix {
		const weights: Matrix = null;

		if (isNumber(rows) && isNumber(cols)) {
			return Matrix.fromParams([rows, cols], () => Math.random() - 0.5);
		}

		return weights;
	}

	/**
	 * Constructor
	 */
	constructor(config: LayerConfig) {
		const {type, activator, layerSize, prevLayerSize, learningRate, moment} = config;

		if (type !== LayerType.INPUT && !Boolean(prevLayerSize)) {
			throw new Error('For layer type HIDDEN or OUTPUT param prevLayerSize is required!');
		}

		this.TYPE = type;
		this.LR = learningRate;
		this.MOMENT = moment;
		this.weights = Layer.initWeight(layerSize, prevLayerSize);
		this.activator = typeof activator === 'function' ? activator : (val) => val;
	}

	/**
	 * Вычислить матрицу выходных сигналов
	 * @param inputs {Matrix} - Матрица выходных сигналов предыдущего слоя
	 */
	public calcOutputs(inputs: Matrix): Matrix {
		if (this.TYPE === LayerType.INPUT) {
			return inputs;
		}

		this.inputs = inputs;
		this.outputs = this.weights
			.dot(inputs)
			.applyFunction(this.activator);

		return this.outputs;
	}

	/**
	 * Вычислить матрицу ошибок для предыдущего слоя
	 * @param errors {Matrix} - Матрица ошибок последующего слоя
	 */
	public calcErrors(errors: Matrix): Matrix {
		if (this.TYPE === LayerType.INPUT) {
			return null;
		}

		const prevLayerErrors = this.weights.T.dot(errors);
		const ones = Matrix.fromParams(this.outputs.size, 1);
		let deltaWeights = errors
			.multiply(this.outputs)
			.multiply(ones.subtract(this.outputs))
			.dot(this.inputs.T)
			.multiply(this.LR);

		if (Boolean(this.prevDeltaWeights) && this.MOMENT !== 0) {
			deltaWeights = deltaWeights.add(this.prevDeltaWeights.multiply(this.MOMENT));
		}

		if (this.MOMENT !== 0) {
			this.prevDeltaWeights = deltaWeights;
		}

		this.weights = this.weights.add(deltaWeights);

		return prevLayerErrors;
	}
}
