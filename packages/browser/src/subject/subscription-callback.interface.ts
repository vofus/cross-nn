export interface SubscriptionCallback<T = any> {
	(value: T): any;
}
