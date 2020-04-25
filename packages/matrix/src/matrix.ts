import { MatrixSize } from './types';
import { isNumber, isMatrixSize, isMatrixArray } from './utils';

export class Matrix {
	private rows: number;
	private cols: number;
	private value: number[][];

	/**
	 * Создать матрицу по заданным параметрам
	 */
	public static fromParams(size: MatrixSize, fillNumber: number): Matrix {
		const condition = isMatrixSize(size) && isNumber(fillNumber);
		let matrix: Matrix = null;

		if (condition) {
			matrix = new Matrix(size);

			for (let rowIndex = 0; rowIndex < size[0]; ++rowIndex) {
				for (let colIndex = 0; colIndex < size[1]; ++colIndex) {
					matrix.set(rowIndex, colIndex, fillNumber);
				}
			}
		}

		return matrix;
	}

	/**
	 * Создать матрицу из массива
	 */
	public static fromArray(array: number[][]): Matrix {
		const condition = isMatrixArray(array);
		let matrix: Matrix = null;

		if (condition) {
			const rows = array.length;
			const cols = array[0].length;
			matrix = new Matrix([rows, cols]);

			for (let rowIndex = 0; rowIndex < rows; ++rowIndex) {
				for (let colIndex = 0; colIndex < cols; ++colIndex) {
					matrix.set(rowIndex, colIndex, array[rowIndex][colIndex]);
				}
			}
		}

		return matrix;
	}

	/**
	 * Получить размер матрицы
	 */
	public get size(): MatrixSize {
		const condition = isNumber(this.rows) && isNumber(this.cols);

		if (condition) {
			return [this.rows, this.cols];
		}

		return null;
	}

	/**
	 * @private Constructor
	 */
	private constructor(size: MatrixSize) {
		this.rows = size[0];
		this.cols = size[1];
		this.value = [];

		for (let i = 0; i < this.rows; ++i) {
			this.value[i] = new Array<number>(this.cols);
		}
	}

	/**
	 * Получить элемент матрицы
	 */
	public get(rowIndex: number, colIndex: number): number {
		if (this.validateIndex(rowIndex, colIndex)) {
			return this.value[rowIndex][colIndex];
		}

		return null
	}

	/**
	 * Установить значение элемента матрицы
	 */
	public set(rowIndex: number, colIndex: number, value: number): void {
		if (this.validateIndex(rowIndex, colIndex) && isNumber(value)) {
			this.value[rowIndex][colIndex] = value;
		}
	}

	/**
	 * Скалярное произведение матриц
	 */
	public dot(matrix: Matrix): Matrix {
		if (!this.validateMultiplyCompatible(matrix)) {
			return null;
		}

		const cols = matrix.size[1];
		const resultMatrix = new Matrix([this.rows, cols]);

		for (let rowIndex = 0; rowIndex < this.rows; ++rowIndex) {
			for (let colIndex = 0; colIndex < cols; ++colIndex) {
				const result = this.value[rowIndex].reduce((acc, item, i) => {
					return acc += item * matrix.get(i, colIndex);
				}, 0);

				resultMatrix.set(rowIndex, colIndex, result);
			}
		}

		return resultMatrix;
	}

	/**
	 * Проверить индекс матрицы на валидность
	 */
	private validateIndex(rowIndex: number, colIndex: number): boolean {
		return isNumber(rowIndex) && isNumber(colIndex)
			&& rowIndex >= 0 && colIndex >= 0
			&& typeof this.value[rowIndex] !== 'undefined'
			&& colIndex < this.value[rowIndex].length;
	}

	/**
	 * Проверить совместимость матрицы для перемножения
	 */
	private validateMultiplyCompatible(matrix: Matrix): boolean {
		const size: MatrixSize = Boolean(matrix) ? matrix.size : null;

		return isMatrixSize(size) && this.cols === size[0];
	}
}
