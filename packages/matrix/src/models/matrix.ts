import { ApplyProcessor, FillProcessor, MatrixSize } from '../types';
import { isNumber, isMatrixSize, isMatrixArray } from '../utils';

export class Matrix {
	private rows: number;
	private cols: number;
	private value: number[][];

	/**
	 * Создать матрицу по заданным параметрам
	 */
	public static fromParams(size: MatrixSize, fillNumber: number | FillProcessor): Matrix {
		const fillNumberIsFunction = typeof fillNumber === 'function';
		const condition = isMatrixSize(size) && (isNumber(fillNumber) || fillNumberIsFunction);
		let matrix: Matrix = null;

		if (condition) {
			matrix = new Matrix(size);

			for (let rowIndex = 0; rowIndex < size[0]; ++rowIndex) {
				for (let colIndex = 0; colIndex < size[1]; ++colIndex) {
					const result = fillNumberIsFunction ? (fillNumber as any)() : fillNumber;
					matrix.set(rowIndex, colIndex, result);
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
	 * Получить транспонированную матрицу
	 */
	public get T(): Matrix {
		const matrix = new Matrix([this.cols, this.rows]);

		for (let rowIndex = 0; rowIndex < this.rows; ++rowIndex) {
			for (let colIndex = 0; colIndex < this.cols; ++colIndex) {
				matrix.set(colIndex, rowIndex, this.get(rowIndex, colIndex));
			}
		}

		return matrix;
	}

	/**
	 * Конвертировать объект Matrix в массив
	 */
	public toArray(): number[][] {
		return this.value;
	}

	/**
	 * Изменить форму матрицы по заданным параметрам.
	 * Доступно изменение на матрицу с таким же количеством элементов.
	 */
	public resize(size: MatrixSize): Matrix {
		const condition = isMatrixSize(size)
			&& (this.rows * this.cols) === (size[0] * size[1]);
		let matrix: Matrix = null;

		if (condition) {
			matrix = new Matrix(size);

			for (let rowIndex = 0; rowIndex < this.rows; ++rowIndex) {
				for (let colIndex = 0; colIndex < this.cols; ++colIndex) {
					const srcIndex = (rowIndex * this.cols) + colIndex;
					const targetRowIndex = Math.floor(srcIndex / size[1]);
					const targetColIndex = srcIndex % size[1];
					const item = this.get(rowIndex, colIndex);

					matrix.set(targetRowIndex, targetColIndex, item);
				}
			}
		}

		return matrix;
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
	 * Получить матрицу, в которой каждый элемент является
	 * произведением элемента исходной матрицы и множителя
	 */
	public multiply(factor: number): Matrix {
		let matrix: Matrix = null;

		if (isNumber(factor)) {
			matrix = new Matrix(this.size);

			for (let rowIndex = 0; rowIndex < this.rows; ++rowIndex) {
				for (let colIndex = 0; colIndex < this.cols; ++colIndex) {
					matrix.set(rowIndex, colIndex, this.get(rowIndex, colIndex) * factor);
				}
			}
		}

		return matrix;
	}

	/**
	 * Получить матрицу, в которой каждый элемент является
	 * значением функции, которая принимает в качестве аргумента
	 * значение элемента из текущей матрицы
	 */
	public applyFunction(processor: ApplyProcessor): Matrix {
		let matrix: Matrix = null;

		if (typeof processor === 'function') {
			matrix = new Matrix(this.size);

			for (let rowIndex = 0; rowIndex < this.rows; ++rowIndex) {
				for (let colIndex = 0; colIndex < this.cols; ++colIndex) {
					const result = processor(this.get(rowIndex, colIndex));
					matrix.set(rowIndex, colIndex, result);
				}
			}
		}

		return matrix;
	}

	/**
	 * Сложение матриц
	 */
	public add(matrix: Matrix): Matrix {
		return this.addSubtract(matrix, 1);
	}

	/**
	 * Вычитание матриц
	 */
	public subtract(matrix: Matrix): Matrix {
		return this.addSubtract(matrix, -1);
	}

	/**
	 * Сложение/вычитание матрицы
	 */
	private addSubtract(matrix: Matrix, factor: number = 1): Matrix {
		const condition = Boolean(matrix) && this.validateSizeCompatible(matrix);
		let _matrix: Matrix = null;

		if (condition) {
			_matrix = new Matrix(this.size);

			for (let rowIndex = 0; rowIndex < this.rows; ++rowIndex) {
				for (let colIndex = 0; colIndex < this.cols; ++colIndex) {
					const result = this.get(rowIndex, colIndex) + (matrix.get(rowIndex, colIndex) * factor);

					_matrix.set(rowIndex, colIndex, result);
				}
			}
		}

		return _matrix;
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

	/**
	 * Проверить, что размеры матриц равны
	 */
	private validateSizeCompatible(matrix: Matrix): boolean {
		const size: MatrixSize = Boolean(matrix) ? matrix.size : null;

		return isMatrixSize(size) && this.rows === size[0] && this.cols === size[1];
	}
}
