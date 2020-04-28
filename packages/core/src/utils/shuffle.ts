import { isNumber } from './is-number';

export const shuffle = <T>(array: T[]): T[] => {
    const condition = Boolean(array) && isNumber(array.length);

    if (!condition || array.length === 0) {
        return [];
    }

    let index = array.length;
    const lastIndex = array.length - 1;
    const result = [...array];

    while (--index >= 0) {
        const rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
        const value = result[rand];

        result[rand] = result[index];
        result[index] = value;
    }
    
    return result;
};