import { TrainReporter } from '../types';

export const defaultTrainReporter: TrainReporter = ({epochNumber, epochTime}) => {
	console.log(`Epoch ${epochNumber}: ${epochTime}ms`);
};
