import { Subject } from './subject';
import { SubscriptionCallback } from './subscription-callback.interface';

export class Subscription<T = any> {
	private subject: Subject = null;
	public callback: SubscriptionCallback<T> = null;

	constructor(subject: Subject, callback: SubscriptionCallback<T>) {
		this.subject = subject;
		this.callback = callback;
	}

	public unsubscribe() {
		this.subject.unsubscribe(this);
	}
}
