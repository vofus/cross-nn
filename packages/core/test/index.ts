import { TrainItem, NeuralNetwork } from '../src/core';

const nn = new NeuralNetwork({
	inputSize: 2,
	hiddenSize: 100,
	outputSize: 1
});

const trainingSet: TrainItem[] = [
	{inputs: [1, 0], targets: [1]},
	{inputs: [0, 1], targets: [1]},
	{inputs: [1, 1], targets: [0]},
	{inputs: [0, 0], targets: [0]}
];

const scaledTrainingSet: TrainItem[] = [];
let scale = 200;

while (scale--) {
	scaledTrainingSet.push(...trainingSet);
}

nn.train(scaledTrainingSet, 10);

console.log('[1, 0]: ', nn.query([1, 0]));
console.log('[0, 1]: ', nn.query([0, 1]));
console.log('[1, 1]: ', nn.query([1, 1]));
console.log('[0, 0]: ', nn.query([0, 0]));
