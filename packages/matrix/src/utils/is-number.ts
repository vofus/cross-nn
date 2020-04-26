// Проверить, что значение является числом и не равно NaN
export const isNumber = (valueForCheck: any): boolean => typeof valueForCheck === 'number' && !isNaN(valueForCheck);
