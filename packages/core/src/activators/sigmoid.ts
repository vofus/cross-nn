import { NdArray, NjParam, sigmoid } from 'numjs';
import { BasicActivator } from './basic-activator';

export class Sigmoid extends BasicActivator {
	protected activate<T = number>(x: NjParam<T>): NdArray<T> {
		return sigmoid(x);
	}
}
