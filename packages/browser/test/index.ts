import { BrowserAdapter } from '../src/browser';
import { NeuralNetwork, LearningGradAlgorithm, NeuralNetworkConfig, TrainItem } from '@cross-nn/core';

// TESTS
xorTest();
// loadTest();
// saveTest();


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

	adapter.gradAlgorithmTrainAsync(
		new NeuralNetwork(nnConfig),
		LearningGradAlgorithm.BACK_PROP,
		scaledTrainSet,
		10
	).then((nn) => {
		console.log('[0, 1]: ', nn.query([0, 1]).toArray());
		console.log('[1, 0]: ', nn.query([1, 0]).toArray());
		console.log('[0, 0]: ', nn.query([0, 0]).toArray());
		console.log('[1, 1]: ', nn.query([1, 1]).toArray());
	})
		.catch(console.error);
}

function loadTest() {
	const adapter = new BrowserAdapter();
	const button = document.getElementById('button-load-nn');

	if (!Boolean(button)) {
		console.error('Кнопка не найдена!');
		return;
	}

	const fileInput = createFileInput();
	fileInput.onchange = async (e: Event) => {
		const nn = await adapter.loadNeuralNetwork(e.target as HTMLInputElement);
		console.log('NN: ', nn);

		console.log('[0, 1]: ', nn.query([0, 1]).toArray());
		console.log('[1, 0]: ', nn.query([1, 0]).toArray());
		console.log('[0, 0]: ', nn.query([0, 0]).toArray());
		console.log('[1, 1]: ', nn.query([1, 1]).toArray());
	};

	button.appendChild(fileInput);
}

function saveTest() {
	const adapter = new BrowserAdapter();
	const link = document.getElementById('download-link') as HTMLLinkElement;

	if (!Boolean(link)) {
		console.error('Ссылка не найдена!');
		return;
	}

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

	adapter.gradAlgorithmTrainAsync(
		new NeuralNetwork(nnConfig),
		LearningGradAlgorithm.BACK_PROP,
		scaledTrainSet,
		10
	).then((nn) => {
		console.log('[0, 1]: ', nn.query([0, 1]).toArray());
		console.log('[1, 0]: ', nn.query([1, 0]).toArray());
		console.log('[0, 0]: ', nn.query([0, 0]).toArray());
		console.log('[1, 1]: ', nn.query([1, 1]).toArray());

		return adapter.saveNeuralNetwork(nn);
	})
		.then((url) => {
			link.setAttribute('href', url);
			link.setAttribute('download', 'neural-network.json');
			console.log('DONE!');
		})
		.catch(console.error);
}

function createFileInput(): HTMLInputElement {
	const input = document.createElement('input') as HTMLInputElement;
	const style = [
		'z-index: -1000;',
		'position: fixed;',
		'left: -1000px;',
		'top: -1000px;',
		'display: block;',
		'width: 1px;',
		'height: 1px;',
		'opacity: 0;'
	].join(' ');

	input.setAttribute('type', 'file');
	input.setAttribute('accept', 'application/json');
	input.setAttribute('style', style);

	return input;
}
