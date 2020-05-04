// @ts-ignore
import mnist from 'mnist';
import { NeuralNetwork } from '../src/models';
import { NeuralNetworkConfig, TrainItem, LearningGradAlgorithm } from '../src/types';


mnistTest();
// xorTest();


function mnistTest() {
	const nnConfig: NeuralNetworkConfig = {
		neuronCounts: [784, 30, 30, 10],
		learningRate: 0.15,
		moment: 0.3
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
		const result = nn.query(mnistItem.input)
			.resize([1, 10])
			.toArray()[0]
			.reduce((res, item, i, arr) => {
				return item > arr[res] ? i : res;
			}, 0);

		console.log('Input: ' + i, '; Output: ' + result + ';');
	}
}

function xorTest() {
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

// console.log('NN: ', nn);
	console.log('[0, 1]: ', nn.query([0, 1]));
	console.log('[1, 0]: ', nn.query([1, 0]));
	console.log('[0, 0]: ', nn.query([0, 0]));
	console.log('[1, 1]: ', nn.query([1, 1]));
}
