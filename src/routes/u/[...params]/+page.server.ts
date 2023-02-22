import type { PageServerLoad } from './$types';
import { User } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { user, type } = await parent();
	const session = await locals.validate();

	return {
		monus: user
			? type === 'likes'
				? await User.getLikedMonus(user.usertag, session?.userId)
				: await User.getMonusByTag(
						user.usertag,
						session?.userId,
						type === 'media',
						type === 'with_replies'
				  )
			: []
	};
};
