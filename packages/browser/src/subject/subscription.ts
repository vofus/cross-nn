import { Subject } from './subject';
import { SubscriptionCallback } from './subscription-callback.interface';

export class Subscription<T = any> {
	private subject: Subject = null;
	public onSuccess: SubscriptionCallback<T> = null;
	public onError: SubscriptionCallback<Error> = null;
	public onComplete: SubscriptionCallback<void> = null;

	constructor(
		subject: Subject,
		onSuccess: SubscriptionCallback<T>,
		onError?: SubscriptionCallback<Error>,
		onComplete?: SubscriptionCallback<void>
	) {
		this.subject = subject;
		this.onSuccess = onSuccess;
		this.onError = onError;
		this.onComplete = onComplete;
	}

	public unsubscribe() {
		this.subject.unsubscribe(this);
	}
}
