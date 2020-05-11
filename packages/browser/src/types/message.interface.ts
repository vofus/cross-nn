import { MessageAction } from './message-action.enum';
import { MessageType } from './message-type.enum';

export interface Message<T = any> {
	type: MessageType;
	action: MessageAction;
	body: T;
}
