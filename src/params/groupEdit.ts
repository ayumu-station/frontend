import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
	let res = false;
	const split = param.split('/');
	if (split[0] === 'new' || (split[0] === 'edit' && param.split('/').length == 2)) {
		res = true;
	}
	return res;
};
