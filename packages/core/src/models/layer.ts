import { Matrix } from '@cross-nn/matrix';
import { Activator, LayerConfig, LayerType } from '../types';
import { isNumber, serializeFunction, deserializeFunction } from '../utils';

export class Layer {
	// Параметры для алгоритма RPROP
	private static readonly LR_DECREASE_FACTOR = 0.5;
	private static readonly LR_INCREASE_FACTOR = 1.2;
	private static readonly LR_MAX = 50;
	private static readonly LR_MIN = 0.000001;
	// Тип слоя
	private TYPE: LayerType;
	// Коэффициент обучения
	private LR: number;
	// Момент
	private MOMENT: number;
	// Функция активации,
	// по умолчанию возвращает значение принимаемого аргумента
	private activator: Activator;
	// Весовые коэффициенты между предыдущим и текущим слоями
	// Для входного слоя эта матрица отсутствует
	private weights: Matrix;
	// Предыдущие изменения весовых коэффициентов
	private prevDeltaWeights: Matrix;
	// Закэшировать входящие и исходящие сигналы при прямом проходе,
	// для того чтобы при обратном проходе рассчитать корректировку весовых коэффициентов
	private inputs: Matrix;
	private outputs: Matrix;
	// Матрица скоростей обучения для каждой связи для алгоритма RPROP
	private LRMatrix: Matrix;
	// Матрица предыдущего градиента ошибки для алгоритма RPROP
	private prevErrorGrad: Matrix;

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
	 * Сериализовать объект слоя нейронной сети в JSON-объект
	 */
	public static serialize(layer: Layer): any {
		return {
			type: layer.TYPE,
			moment: layer.MOMENT,
			learningRate: layer.LR,
			activator: serializeFunction<Activator>(layer.activator),
			inputs: Boolean(layer.inputs) ? layer.inputs.toArray() : null,
			outputs: Boolean(layer.outputs) ? layer.outputs.toArray() : null,
			weights: Boolean(layer.weights) ? layer.weights.toArray() : null,
			prevDeltaWeights: Boolean(layer.prevDeltaWeights) ? layer.prevDeltaWeights.toArray() : null,
		};
	}

	/**
	 * Десериализовать объект слоя нейронной сети из JSON-объекта
	 */
	public static deserialize(parsed: any): Layer {
		const layer = new Layer();

		layer.LR = parsed.learningRate;
		layer.TYPE = parsed.type;
		layer.MOMENT = parsed.moment;
		layer.inputs = Matrix.fromArray(parsed.inputs);
		layer.outputs = Matrix.fromArray(parsed.outputs);
		layer.weights = Matrix.fromArray(parsed.weights);
		layer.prevDeltaWeights = Matrix.fromArray(parsed.prevDeltaWeights);
		layer.activator = deserializeFunction<Activator>(parsed.activator);

		return layer;
	}

	/**
	 * Constructor
	 */
	constructor(config?: LayerConfig) {
		if (Boolean(config)) {
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

	/**
	 * Вычислить матрицу ошибок для предыдущего слоя для алгоритма RPROP
	 */
	public calcErrorsRProp(errors: Matrix): Matrix {
		if (this.TYPE === LayerType.INPUT) {
			return null;
		}

		if (!Boolean(this.LRMatrix)) {
			this.LRMatrix = Matrix.fromParams(this.weights.size, this.LR);
		}

		const prevLayerErrors = this.weights.T.dot(errors);
		const ones = Matrix.fromParams(this.outputs.size, 1);
		const errorGrad = errors
			.multiply(this.outputs)
			.multiply(ones.subtract(this.outputs))
			.dot(this.inputs.T);

		if (Boolean(this.prevErrorGrad)) {
			const changesErrorGrad = this.prevErrorGrad.multiply(errorGrad);
			const [rows, cols] = this.LRMatrix.size;

			for (let rowIndex = 0; rowIndex < rows; ++rowIndex) {
				for (let colIndex = 0; colIndex < cols; ++colIndex) {
					const changeGrad = changesErrorGrad.get(rowIndex, colIndex);
					let LR = this.LRMatrix.get(rowIndex, colIndex);

					if (changeGrad > 0) {
						LR = Math.min(LR * Layer.LR_INCREASE_FACTOR, Layer.LR_MAX);
					}

					if (changeGrad < 0) {
						LR = Math.max(LR * Layer.LR_DECREASE_FACTOR, Layer.LR_MIN);
					}

					this.LRMatrix.set(rowIndex, colIndex, LR);
				}
			}
		}

		const deltaWeights = !Boolean(this.prevErrorGrad)
			? errorGrad
				.multiply(this.LRMatrix)
			: errorGrad
				.applyFunction((i) => i === 0 ? 0 : i > 0 ? 1 : -1)
				.multiply(this.LRMatrix);

		this.prevErrorGrad = errorGrad;
		this.weights = this.weights.subtract(deltaWeights);

		return prevLayerErrors;
	}
}
