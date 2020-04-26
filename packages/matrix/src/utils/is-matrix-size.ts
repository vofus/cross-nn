import { isNumber } from './is-number';

// Проверить, что значение является MatrixSize
export const isMatrixSize = (val: any): boolean => {
	return Array.isArray(val) && val.length === 2 && isNumber(val[0]) && isNumber(val[1]);
};
