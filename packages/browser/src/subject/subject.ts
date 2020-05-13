import { Subscription } from './subscription';
import { SubscriptionCallback } from './subscription-callback.interface';

export class Subject<T = any> {
	private subscriptions: Subscription[] = [];
	private isComplete = false;

	public subscribe(
		onSuccess: SubscriptionCallback<T>,
		onError?: SubscriptionCallback<Error>,
		onComplete?: SubscriptionCallback<void>
	): Subscription {
		if (!this.isComplete) {
			const subscription = new Subscription<T>(this, onSuccess, onError, onComplete);
			this.subscriptions.push(subscription);

			return subscription;
		}

		throw new Error('This Subject is completed!');
	}

	public unsubscribe(subscription: Subscription) {
		if (Boolean(subscription)) {
			this.subscriptions = this.subscriptions
				.filter((s) => s !== subscription);
		}
	}

	public next(value: T) {
		for (const subscription of this.subscriptions) {
			typeof subscription.onSuccess === 'function' && subscription.onSuccess(value);
		}
	}

	public emitError(err: Error) {
		for (const subscription of this.subscriptions) {
			typeof subscription.onError === 'function' && subscription.onError(err);
		}
	}

	public complete() {
		for (const subscription of this.subscriptions) {
			typeof subscription.onComplete === 'function' && subscription.onComplete();
		}

		this.isComplete = true;
		this.subscriptions = [];
	}
}
