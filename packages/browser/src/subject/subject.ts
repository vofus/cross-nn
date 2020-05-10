import { Subscription } from './subscription';
import { SubscriptionCallback } from './subscription-callback.interface';

export class Subject<T = any> {
	private subscriptions: Subscription[] = [];

	public subscribe(callback: SubscriptionCallback<T>): Subscription {
		const subscription = new Subscription<T>(this, callback);
		this.subscriptions.push(subscription);

		return subscription;
	}

	public unsubscribe(subscription: Subscription) {
		if (Boolean(subscription)) {
			this.subscriptions = this.subscriptions
				.filter((s) => s !== subscription);
		}
	}

	public next(value: T) {
		for (const subscription of this.subscriptions) {
			subscription.callback(value);
		}
	}
}
