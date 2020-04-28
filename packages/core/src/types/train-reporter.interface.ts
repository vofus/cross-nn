import { TrainMessage } from './train-message.interface';

export interface TrainReporter {
	(message: TrainMessage): void;
}
