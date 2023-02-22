/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from '$lib/server/db';
import { error, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	follow: async ({ request, locals }) => {
		const { session, user } = await locals.validateUser();
		const data = await request.formData();
		const targetTag = data.get('usertag')?.toString();
		if (!session) {
			throw error(401, {
				message: '막 접근하지 말아주세요...'
			});
		} else if (!targetTag || targetTag === user.usertag) {
			throw error(400, {
				message: '올바른 값이 전달되지 않았습니다.'
			});
		} else {
			const follow = data.get('follow')?.toString();
			const id = session.userId;
			const res = await User.follow(id, targetTag, Boolean(follow));
			return { success: res === -1 ? false : true, followerCount: res };
		}
	},
	getFollow: async ({ request, locals }) => {
		const session = await locals.validate();
		const data = await request.formData();
		const targetTag = data.get('usertag')?.toString();
		const type = data.get('type')?.toString();
		const c = data.get('c')?.toString();
		if (!targetTag || (type !== 'follower' && type !== 'following')) {
			throw error(400, {
				message: '올바른 값이 전달되지 않았습니다.'
			});
		} else {
			return { data: await User.getFollow(type, targetTag, session?.userId, c) };
		}
	},
	suggestion: async ({ request }) => {
		const data = await request.formData();
		const q = data.get('q')?.toString();
		if (!q) {
			throw error(400, {
				message: '올바른 값이 전달되지 않았습니다.'
			});
		} else {
			return { data: await User.suggestion(q) };
		}
	}
};
