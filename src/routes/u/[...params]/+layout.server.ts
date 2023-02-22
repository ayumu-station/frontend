import type { LayoutServerLoad } from './$types';
import { User } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ params: { params }, locals }) => {
	const session = await locals.validate();
	const paramSplit = params.split('/');
	const usertag = paramSplit[0];
	let type: 'home' | 'media' | 'with_replies' | 'likes' = 'home';
	if (paramSplit.length > 1) {
		switch (paramSplit[1]) {
			case 'media':
			case 'with_replies':
			case 'likes':
				type = paramSplit[1];
				break;

			default:
				break;
		}
	}
	const user = await User.getByTag(usertag, session?.userId);
	if (!user) {
		throw error(404, { message: 'User not found' });
	}
	const followedInFollowing = session
		? await User.getFollowedInFollowing(session?.userId, user.userid)
		: [];
	return { type, user, followedInFollowing };
};
