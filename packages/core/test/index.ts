// @ts-ignore
import mnist from 'mnist';
import { NeuralNetwork } from '../src/models';
import { NeuralNetworkConfig, TrainItem, LearningGradAlgorithm, Activator } from '../src/types';
import { serializeFunction, deserializeFunction } from '../src/utils';
import { sigmoid } from '../src/activators';

// serializeNN();
// serializeTest();
// mnistTest();
// mnistTestRProp();
// xorTest();
// xorTestRProp();
// xorTestQuickProp();
mnistTestQuickProp();

function serializeNN() {
	const nnConfig: NeuralNetworkConfig = {
		neuronCounts: [2, 30, 50, 30, 1],
		learningRate: 0.3,
		moment: 0.3
	};

	const trainSet: TrainItem[] = [
		{inputs: [0, 1], targets: [1]},
		{inputs: [1, 0], targets: [1]},
		{inputs: [0, 0], targets: [0]},
		{inputs: [1, 1], targets: [0]}
	];

	const scaledTrainSet: TrainItem[] = [];
	for (let i = 0; i < 100; ++i) {
		scaledTrainSet.push(...trainSet);
	}

	const nn = new NeuralNetwork(nnConfig);
	nn.gradAlgorithmTrain(LearningGradAlgorithm.BACK_PROP, scaledTrainSet, 10);

	const sNN = NeuralNetwork.serialize(nn);
	const dNN = NeuralNetwork.deserialize(sNN);

	console.log(sNN);

	console.log('[0, 1]: ', dNN.query([0, 1]));
	console.log('[1, 0]: ', dNN.query([1, 0]));
	console.log('[0, 0]: ', dNN.query([0, 0]));
	console.log('[1, 1]: ', dNN.query([1, 1]));
}

function serializeTest() {
	const sf = serializeFunction<Activator>(sigmoid);
	const df = deserializeFunction<Activator>(sf);

	console.log('sigmoid: ', sigmoid.toString());
	console.log('SF: ', sf);
	console.log('DF: ', df.toString());
	console.log('CALC: ', df(10));
}

function mnistTest() {
	const nnConfig: NeuralNetworkConfig = {
		neuronCounts: [784, 100, 10],
		learningRate: 0.15
	};

	const trainSet: TrainItem[] = mnist.set(100, 0).training
		.map<TrainItem>((item: any) => {
			return {
				inputs: item.input,
				targets: item.output
			};
		});

	const nn = new NeuralNetwork(nnConfig);
	nn.gradAlgorithmTrain(LearningGradAlgorithm.BACK_PROP, trainSet, 10);

	for (let i = 0; i < 10; ++i) {
		const mnistItem = mnist[i].set(0, 9)[i];
		const response = nn.query(mnistItem.input)
			.resize([1, 10])
			.toArray()[0];
		console.log('RESPONSE: ', response);

		const result = response
			.reduce((res, item, i, arr) => {
				return item > arr[res] ? i : res;
			}, 0);

		console.log('Input: ' + i, '; Output: ' + result + ';');
	}
}

function xorTest() {
	const nnConfig: NeuralNetworkConfig = {
		neuronCounts: [2, 30, 50, 30, 1],
		learningRate: 0.3
	};

	const trainSet: TrainItem[] = [
		{inputs: [0, 1], targets: [1]},
		{inputs: [1, 0], targets: [1]},
		{inputs: [0, 0], targets: [0]},
		{inputs: [1, 1], targets: [0]}
	];

	const scaledTrainSet: TrainItem[] = [];
	for (let i = 0; i < 100; ++i) {
		scaledTrainSet.push(...trainSet);
	}

	const nn = new NeuralNetwork(nnConfig);
	nn.gradAlgorithmTrain(LearningGradAlgorithm.BACK_PROP, scaledTrainSet, 10);

	console.log('[0, 1]: ', nn.query([0, 1]));
	console.log('[1, 0]: ', nn.query([1, 0]));
	console.log('[0, 0]: ', nn.query([0, 0]));
	console.log('[1, 1]: ', nn.query([1, 1]));
}

function xorTestRProp() {
	const nnConfig: NeuralNetworkConfig = {
		neuronCounts: [2, 20, 30, 10, 1],
		learningRate: 0.1
	};

	const trainSet: TrainItem[] = [
		{inputs: [0, 1], targets: [1]},
		{inputs: [1, 0], targets: [1]},
		{inputs: [0, 0], targets: [0]},
		{inputs: [1, 1], targets: [0]}
	];

	const scaledTrainSet: TrainItem[] = [];
	for (let i = 0; i < 100; ++i) {
		scaledTrainSet.push(...trainSet);
	}

	const nn = new NeuralNetwork(nnConfig);
	nn.gradAlgorithmTrain(LearningGradAlgorithm.R_PROP, scaledTrainSet, 50);

	console.log('[0, 1]: ', nn.query([0, 1]).toArray());
	console.log('[1, 0]: ', nn.query([1, 0]).toArray());
	console.log('[0, 0]: ', nn.query([0, 0]).toArray());
	console.log('[1, 1]: ', nn.query([1, 1]).toArray());
}


function mnistTestRProp() {
	const nnConfig: NeuralNetworkConfig = {
		neuronCounts: [784, 50, 10],
		learningRate: 0.1
	};

	const trainSet: TrainItem[] = mnist.set(200, 0).training
		.map<TrainItem>((item: any) => {
			return {
				inputs: item.input,
				targets: item.output
			};
		});

	const nn = new NeuralNetwork(nnConfig);
	nn.gradAlgorithmTrain(LearningGradAlgorithm.R_PROP, trainSet, 5);

	for (let i = 0; i < 10; ++i) {
		const mnistItem = mnist[i].set(0, 9)[i];
		const response = nn.query(mnistItem.input)
			.resize([1, 10])
			.toArray()[0];
		console.log('RESPONSE: ', response);

		const result = response
			.reduce((res, item, i, arr) => {
				return item > arr[res] ? i : res;
			}, 0);

		console.log('Input: ' + i, '; Output: ' + result + ';');
	}
}

function xorTestQuickProp() {
	const nnConfig: NeuralNetworkConfig = {
		neuronCounts: [2, 10, 20, 30, 40, 50, 1],
		learningRate: 0.6
	};

	const trainSet: TrainItem[] = [
		{inputs: [0, 1], targets: [1]},
		{inputs: [1, 0], targets: [1]},
		{inputs: [0, 0], targets: [0]},
		{inputs: [1, 1], targets: [0]}
	];

	const scaledTrainSet: TrainItem[] = [];
	for (let i = 0; i < 100; ++i) {
		scaledTrainSet.push(...trainSet);
	}

	const nn = new NeuralNetwork(nnConfig);
	nn.gradAlgorithmTrain(LearningGradAlgorithm.QUICK_PROP, scaledTrainSet, 5);

	console.log('[0, 1]: ', nn.query([0, 1]).toArray());
	console.log('[1, 0]: ', nn.query([1, 0]).toArray());
	console.log('[0, 0]: ', nn.query([0, 0]).toArray());
	console.log('[1, 1]: ', nn.query([1, 1]).toArray());
}


function mnistTestQuickProp() {
	const nnConfig: NeuralNetworkConfig = {
		neuronCounts: [784, 100, 10],
		learningRate: 0.03
	};

	const trainSet: TrainItem[] = mnist.set(100, 0).training
		.map<TrainItem>((item: any) => {
			return {
				inputs: item.input,
				targets: item.output
			};
		});

	const nn = new NeuralNetwork(nnConfig);
	nn.gradAlgorithmTrain(LearningGradAlgorithm.QUICK_PROP, trainSet, 5);

	for (let i = 0; i < 10; ++i) {
		const mnistItem = mnist[i].set(0, 9)[i];
		const response = nn.query(mnistItem.input)
			.resize([1, 10])
			.toArray()[0];
		console.log('RESPONSE: ', response);

		const result = response
			.reduce((res, item, i, arr) => {
				return item > arr[res] ? i : res;
			}, 0);

		console.log('Input: ' + i, '; Output: ' + result + ';');
	}
}
