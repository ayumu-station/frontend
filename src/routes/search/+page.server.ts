import type { PageServerLoad } from './$types';
import { Hashtag, Monu } from '$lib/server/db';

// If the user exists, redirect authenticated users to the profile page.
export const load: PageServerLoad = async ({ locals, url: { searchParams } }) => {
	const p = searchParams.get('p');
	if (!p) return { monus: [] };

	const user = await locals.validate();
	const c = searchParams.get('c');
	const monus = p.startsWith('#')
		? await Hashtag.search(p.substring(1), c, user?.userId)
		: await Monu.search(p, c, user?.userId);
	const hashtag = p.startsWith('#') ? await Hashtag.get(p.substring(1)) : undefined;

	return { monus, hashtag };
};
