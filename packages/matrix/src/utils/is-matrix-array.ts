import { isNumber } from './is-number';

export const isMatrixArray = (val: any): boolean => {
	if (!Array.isArray(val) || !Array.isArray(val[0])) {
		return false;
	}

	const firstRowSize = val[0].length;
	let allRowSizesIsSame = true;
	let allColValuesIsNumber = true;

	for (let rowIndex = 0; rowIndex < val.length; ++rowIndex) {
		allRowSizesIsSame = allRowSizesIsSame
			&& Array.isArray(val[rowIndex])
			&& firstRowSize === val[rowIndex].length;

		if (!allRowSizesIsSame) {
			break;
		}

		for (let colIndex = 0; colIndex < val[rowIndex].length; ++colIndex) {
			allColValuesIsNumber = allColValuesIsNumber && isNumber(val[rowIndex][colIndex]);

			if (!allColValuesIsNumber) {
				break;
			}
		}

		if (!allColValuesIsNumber) {
			break;
		}
	}

	return allRowSizesIsSame && allColValuesIsNumber;
};
