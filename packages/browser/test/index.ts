import { BrowserAdapter } from '../src/browser';
import { NeuralNetwork, LearningGradAlgorithm, NeuralNetworkConfig, TrainItem } from '@cross-nn/core';

// TESTS
xorTest();


function xorTest() {
	const adapter = new BrowserAdapter();

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

	// const nn = new NeuralNetwork(nnConfig);
	// nn.gradAlgorithmTrain(LearningGradAlgorithm.BACK_PROP, scaledTrainSet, 10);

	adapter.gradAlgorithmTrainAsync(
		new NeuralNetwork(nnConfig),
		LearningGradAlgorithm.BACK_PROP,
		scaledTrainSet,
		10
	).then((nn) => {
		console.log('[0, 1]: ', nn.query([0, 1]));
		console.log('[1, 0]: ', nn.query([1, 0]));
		console.log('[0, 0]: ', nn.query([0, 0]));
		console.log('[1, 1]: ', nn.query([1, 1]));
	});
}
