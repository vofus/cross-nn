import { Matrix } from '../src/models/matrix';

const m_01 = Matrix.fromArray([[1,2], [3,4]]);
const m_02 = Matrix.fromArray([[1], [2]]);

console.log(m_01.multiply(2));
console.log(m_02.subtract(Matrix.fromArray([[1], [1]])));

if (Boolean(m_01) && Boolean(m_02)) {
	const result = m_01.dot(m_02);
	console.log(result);
}
