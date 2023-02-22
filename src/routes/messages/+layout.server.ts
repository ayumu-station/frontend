import type { LayoutServerLoad } from './$types';
import { Message, User } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.validate();
	if (!session) throw redirect(307, '/login');
	const groups = await Message.getGroups(session.userId);
	return { groups };
};
