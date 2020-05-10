import { MessageAction } from './message-action.enum';
import { MessageType } from './message-type.enum';

export interface TrainMessage<T = any> {
	id: string;
	type: MessageType;
	action: MessageAction;
	body: T;
}
