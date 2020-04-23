import nj, { NdArray } from 'numjs';
import { shuffle as _shuffle } from 'lodash/fp';
import { Sigmoid } from '../activators/sigmoid';
import { ActivationStrategy } from '../activators/types';
import {
	BackPropResult,
	ForwardPropResult,
	LearningType,
	NeuralNetworkConfig,
	RelationType,
	TrainItem,
	TrainReporter
} from './types';
import { defaultTrainReporter } from './default-train-reporter';

export class NeuralNetwork {
	private static readonly LR_DEFAULT: number = 0.3;
	private static readonly MOMENT_DEFAULT: number = 0;
	private static readonly R_PROP_PARAMS = {
		LR_MIN: 0.000001,
		LR_MAX: 50,
		LR_INC_MULT: 1.2,
		LR_DEC_MULT: 0.5
	};

	// сериализуем тренированную модель
	static serialize(nn: NeuralNetwork): string {
		throw new Error('Serialize method must be implemented!');
	}

	// десериализуем тренированную модель
	static deserialize(serializedString: string): NeuralNetwork {
		throw new Error('Deserialize method must be implemented!');
	}

	// GENERAL_PARAMS
	// Тип обучения
	private LEARNING_TYPE: LearningType;
	// Скорость обучения
	private LEARNING_RATE: number;
	// Момент
	private MOMENT: number;
	// Матрица весов между входным и скрытым слоем
	private weightsIH: NdArray;
	// Матрица весов между скрытым и выходным слоем
	private weightsHO: NdArray;
	// Матрица предыдущих изменений весов между входным и скрытым слоем
	private prevDeltaWeightsIH: NdArray;
	// Матрица предыдущих изменений весов между скрытым и выходным слоем
	private prevDeltaWeightsHO: NdArray;
	// Объект-активатор (По умолчанию сигмоида)
	private activator: ActivationStrategy;

	// RPROP_PARAMS
	// Флаг использования метода обучения RProp
	private useRProp: boolean = false;
	// Матрица предыдущих скоростей обучения между входным и скрытым слоем
	private prevLerningRateIH: NdArray;
	// Матрица предыдущих скоростей обучения между скрытым и выходным слоем
	private prevLerningRateHO: NdArray;
	// Матрица предыдущих ошибок между входным и скрытым слоем
	private prevErrorsIH: NdArray;
	// Матрица предыдущих ошибок между скрытым и выходным слоем
	private prevErrorsHO: NdArray;

	constructor({
		inputSize,
		hiddenSize,
		outputSize,
		learningType= 'ERROR_BACKPROP',
		activator= new Sigmoid(),
		learningRate= NeuralNetwork.LR_DEFAULT,
		moment = NeuralNetwork.MOMENT_DEFAULT
	}: NeuralNetworkConfig) {
		this.LEARNING_TYPE = learningType;
		this.LEARNING_RATE = learningRate;
		this.MOMENT = moment;
		this.activator = activator;
		this.weightsIH = this.generateWeights(hiddenSize, inputSize);
		this.weightsHO = this.generateWeights(outputSize, hiddenSize);

		if (this.LEARNING_TYPE === 'R_PROP') {
			this.initRProp();
		}
	}

	/**
	 * Инициализация дополнительных матриц для RProp
	 */
	private initRProp() {
		this.prevErrorsIH = nj.ones(this.weightsIH.shape);
		this.prevErrorsHO = nj.ones(this.weightsHO.shape);

		this.prevLerningRateIH = nj.zeros(this.weightsIH.shape).assign(this.LEARNING_RATE, false);
		this.prevLerningRateHO = nj.zeros(this.weightsHO.shape).assign(this.LEARNING_RATE, false);
	}

	/**
	 * Тренируем сеть
	 * @param trainSet {TrainItem[]} тренировочная выборка
	 * @param epochs {number} количество эпох обучения
	 * @param reporter {TrainReporter} функция обратного вызова для отслеживания состояния обучения
	 */
	train(trainSet: TrainItem[], epochs: number, reporter: TrainReporter = defaultTrainReporter): void {
		let epochCounter = 0;

		while (++epochCounter <= epochs) {
			const shuffled: TrainItem[] = _shuffle(trainSet);
			let startDate = Date.now();
			let trainCounter = shuffled.length;

			while (--trainCounter >= 0) {
				const { inputs, targets } = shuffled[trainCounter];
				this.trainStep(inputs, targets);
			}

			reporter({
				epochNumber: epochCounter,
				epochTime: Date.now() - startDate
			});
		}
	}

	/**
	 * Выполняем запрос к сети
	 * @param inputs {number[]} входные сигналы
	 */
	query(inputs: number[]): number[] {
		const inputMatrix = nj.array(inputs).reshape(1, inputs.length).T as NdArray;
		const { finalOutputs } = this.forwardPropagation(inputMatrix);

		return finalOutputs.tolist<number[]>().reduce((res: number[], item: number[]) => {
			res.push(...item);

			return res;
		}, []);
	}


	/**
	 * Шаг обучения
	 * @param inputs {number[]} входные сигналы
	 * @param targets {number[]} ожидаемый результат
	 */
	private trainStep(inputs: number[], targets: number[]): void {
		const inputMatrix = nj.array(inputs, "float64").reshape(1, inputs.length).T as NdArray;
		const targetMatrix = nj.array(targets, "float64").reshape(1, targets.length).T as NdArray;

		const forwardResult = this.forwardPropagation(inputMatrix);
		const backResult = this.backPropagation(inputMatrix, targetMatrix, forwardResult);

		this.prevDeltaWeightsHO = backResult.deltaWeightsHO;
		this.prevDeltaWeightsIH = backResult.deltaWeightsIH;
		this.weightsHO = backResult.weightsHO;
		this.weightsIH = backResult.weightsIH;
	}

	/**
	 * Генерируем начаьную матрицу весов
	 * @param rows {number} Количество строк
	 * @param columns {number} Количество столбцов
	 * @returns {NdArray}
	 */
	private generateWeights(rows: number, columns: number): NdArray {
		return nj.random([rows, columns]).subtract(0.5);
	}

	/**
	 * Подсчитываем дополнительные веса
	 */
	private calcAdditionalWeights(inputs: NdArray, outputs: NdArray, errors: NdArray, type: RelationType): NdArray {
		const ones = nj.ones(outputs.shape) as NdArray;
		const arg1 = errors.multiply(outputs).multiply(nj.subtract(ones, outputs));
		const arg2 = inputs.T;

		if (type === "HO") {
			const deltaWeights = nj.dot(arg1, arg2).multiply(this.LEARNING_RATE);

			return Boolean(this.prevDeltaWeightsHO) && this.MOMENT !== 0
				? deltaWeights.add(this.prevDeltaWeightsHO.multiply(this.MOMENT))
				: deltaWeights;
		}

		if (type === "IH") {
			const deltaWeights = nj.dot(arg1, arg2).multiply(this.LEARNING_RATE);

			return Boolean(this.prevDeltaWeightsIH) && this.MOMENT !== 0
				? deltaWeights.add(this.prevDeltaWeightsIH.multiply(this.MOMENT))
				: deltaWeights;
		}
	}


	/**
	 * Прямое распространение сигнала
	 * @param inputMatrix {NdArray} Входные сигналы, приобразованные в двумерный массив
	 * @returns {ForwardResult}
	 */
	private forwardPropagation(inputMatrix: NdArray): ForwardPropResult {
		const hiddenInputs = this.weightsIH.dot(inputMatrix);
		const hiddenOutputs = this.activator.execute(hiddenInputs);

		const finalInputs = this.weightsHO.dot(hiddenOutputs);
		const finalOutputs = this.activator.execute(finalInputs);

		return {
			hiddenOutputs,
			finalOutputs
		};
	}


	/**
	 * Обратное распространение ошибки
	 * @param inputMatrix {NdArray} Входные сигналы, приобразованные в двумерный массив
	 * @param targetMatrix {NdArray} Ожидаемые результаты, приобразованные в двумерный массив
	 * @param result {ForwardResult} Объект с выходными сигналами на слоях после прямого прохода
	 */
	private backPropagation(inputMatrix: NdArray, targetMatrix: NdArray, result: ForwardPropResult): BackPropResult {
		const { hiddenOutputs, finalOutputs } = result;
		const outputErrors = targetMatrix.subtract(finalOutputs);
		const hiddenErrors = this.weightsHO.T.dot(outputErrors);

		const deltaWeightsHO = this.calcAdditionalWeights(hiddenOutputs, finalOutputs, outputErrors, "HO");
		const deltaWeightsIH = this.calcAdditionalWeights(inputMatrix, hiddenOutputs, hiddenErrors, "IH");

		const weightsHO = this.weightsHO.add(deltaWeightsHO);
		const weightsIH = this.weightsIH.add(deltaWeightsIH);

		return {
			deltaWeightsHO,
			deltaWeightsIH,
			weightsHO,
			weightsIH
		};
	}
}
