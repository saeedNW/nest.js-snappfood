/**
 * check if the given value is a boolean or string boolean
 * @param value - The value which should be checked
 */
export function isBoolean(value: any): boolean | any {
	return [true, false, "true", "false"].includes(value);
}

/**
 * Convert string boolean to a valid boolean
 * @param value - The value which should be converted to boolean
 */
export function toBoolean(value: any): boolean | any {
	if ([true, "true"].includes(value)) return true;
	if ([false, "false"].includes(value)) return false;
	return value;
}
