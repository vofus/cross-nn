import { Activator } from '../types';

export const sigmoid: Activator = (value) => {
	return 1 / (1 + (1 / Math.pow(Math.E, value)));
};
