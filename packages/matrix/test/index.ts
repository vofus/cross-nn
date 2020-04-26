import { Matrix } from '../src/models/matrix';

const m_01 = Matrix.fromParams([3, 3], () => Math.random() - 0.5);

for (let i = 0; i < 3; ++i) {
	for(let j = 0; j < 3; ++j) {
		console.log(m_01.get(i, j));
	}
}
