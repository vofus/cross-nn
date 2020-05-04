import { Matrix } from '../src/models';

const m_01 = Matrix.fromParams([4, 3], () => Math.random() - 0.5);

console.log('Before resize: ', m_01.toArray());
console.log('After resize: ', m_01.resize([2, 6]).toArray());
