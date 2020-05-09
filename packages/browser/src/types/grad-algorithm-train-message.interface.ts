import { MessageAction } from './message-action.type';

export interface GradAlgorithmTrainMessage {
	action: MessageAction;
	id: string;
	serializedNetwork: string;
	args: any[];
}
