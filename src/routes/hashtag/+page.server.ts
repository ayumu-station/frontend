import { Hashtag } from '$lib/server/db';
import { error, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	suggestion: async ({ request }) => {
		const data = await request.formData();
		const q = data.get('q')?.toString();
		if (!q) {
			throw error(400, {
				message: '올바른 값이 전달되지 않았습니다.'
			});
		} else {
			return { data: await Hashtag.suggestion(q) };
		}
	}
};
