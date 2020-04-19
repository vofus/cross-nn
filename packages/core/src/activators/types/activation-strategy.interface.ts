import { NdArray, NjParam } from 'numjs';

export interface ActivationStrategy {
	execute<T = number>(x: NjParam<T>): NdArray<T>;
}
