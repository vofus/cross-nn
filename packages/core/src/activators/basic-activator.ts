import { NdArray, NjParam } from 'numjs';
import { ActivationStrategy } from './types';

export abstract class BasicActivator implements ActivationStrategy {
	protected abstract activate<T = number>(x: NjParam<T>): NdArray<T>;

	execute<T = number>(x: NjParam<T>): NdArray<T> {
		return this.activate(x);
	}
}
