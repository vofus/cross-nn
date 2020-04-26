// Проверить, что значение является числом и не равно NaN
export const isNumber = (value: any): boolean => typeof value === 'number' && !isNaN(value);
