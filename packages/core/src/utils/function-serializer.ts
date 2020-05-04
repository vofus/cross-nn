const PURE_FUNCTION_PATTERN = /function.*?\(/ims;
const PURE_ARGS_PATTERN = /^function.*\((.*)\)(.*)$/ims;
const PURE_BODY_PATTERN = /^function.*{(.*)}(.*)$/ims;
const ARROW_FUNCTION_PATTERN = /.*?=>.*?/ims;
const ARGS_SEPARATOR = /\s*,\s*/i;
const BRACERS_PATTERN = /[()]/img;

export function serialize<T extends Function>(foo: T): string[] {
	const fooSrc = foo.toString();
	const result: string[] = [];

	if (PURE_FUNCTION_PATTERN.test(fooSrc)) {
		const args = (fooSrc.match(PURE_ARGS_PATTERN)[1] || '')
			.trim()
			.split(ARGS_SEPARATOR)
			.filter(Boolean);

		const body = (fooSrc.match(PURE_BODY_PATTERN)[1] || '').trim();

		Boolean(body)
			? result.push(...args, body)
			: result.push(...args);
	}

	if (ARROW_FUNCTION_PATTERN.test(fooSrc)) {
		const splitFoo = fooSrc.split('=>');
		const args = (splitFoo[0] || '')
			.replace(BRACERS_PATTERN, '')
			.trim()
			.split(ARGS_SEPARATOR)
			.filter(Boolean);

		const body = (splitFoo[1] || '').trim();
		const preparedBody = body[0] === '{' && body[body.length - 1] === '}'
			? body.slice(1, body.length - 1)
			: `return ${body}`;

		Boolean(body) && Boolean(preparedBody)
			? result.push(...args, preparedBody)
			: result.push(...args);
	}

	return result;
}

export function deserialize<T extends Function>(fooParts: string[]): T {
	if (!Boolean(fooParts) || !Boolean(fooParts.length)) {
		throw new Error('Function can not deserialize!');
	}

	return new Function(...fooParts) as T;
}
