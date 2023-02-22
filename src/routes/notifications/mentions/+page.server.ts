import type { PageServerLoad } from './$types';
import { Notification } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url: { searchParams } }) => {
	const session = await locals.validate();
	const c = searchParams.get('c');
	const cursors = c ? JSON.parse(c) : null;
	if (!Array.isArray(cursors) && cursors !== null) {
		throw error(400);
	}
	if (!session || !session) throw redirect(307, '/login');

	const notifications = await Notification.getMention(session.userId, cursors);

	return { notifications };
};
