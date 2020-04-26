import { Matrix } from '@cross-nn/matrix';
import { isNumber } from '../utils';
import { Activator, LayerConfig, LayerType } from '../types';

export class Layer {
	// Тип слоя
	private readonly TYPE: LayerType;

	// Коэффициент обучения
	private readonly LR: number;

	// Функция активации,
	// по умолчанию возвращает значение принимаемого аргумента
	private readonly activator: Activator;

	// Весовые коэффициенты между предыдущим и текущим слоями
	// Для входного слоя эта матрица отсутствует
	private weights: Matrix;

	/**
	 * Constructor
	 */
	constructor({
			type,
			activator,
			layerSize,
			prevLayerSize,
			learningRate
		}: LayerConfig) {
		if (type !== LayerType.INPUT && !Boolean(prevLayerSize)) {
			throw new Error('For layer type HIDDEN or OUTPUT param prevLayerSize is required!');
		}

		this.TYPE = type;
		this.LR = learningRate;
		this.weights = this.initWeight(layerSize, prevLayerSize);
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

		return this.weights
			.dot(inputs.T)
			.applyFunction(this.activator);
	}

	/**
	 * Вычислить матрицу ошибок для предыдущего слоя
	 * @param errors {Matrix} - Матрица ошибок последующего слоя
	 */
	public calcErrors(errors: Matrix): Matrix {
		return null;
	}

	/**
	 * Инициализировать матрицу весовых коэффициентов
	 */
	private initWeight(rows: number, cols: number): Matrix {
		const weights: Matrix = null;

		if (isNumber(rows) && isNumber(cols)) {
			return Matrix.fromParams([rows, cols], () => Math.random() - 0.5);
		}

		return weights;
	}
}
