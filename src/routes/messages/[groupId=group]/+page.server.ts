import type { PageServerLoad } from './$types';
import { Message, User } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({
	locals,
	params: { groupId },
	parent,
	url: { searchParams }
}) => {
	const { groups } = await parent();
	const session = await locals.validate();
	const cursor = searchParams.get('c');
	if (!session) throw redirect(307, '/login');
	const i = groups.findIndex((group) => group.id === groupId);
	if (i === -1) {
		throw redirect(302, `/messages`);
	}
	return {
		messages: session ? await Message.getGroupMessages(session.userId, groupId, cursor) : [],
		users: session ? await Message.getGroupUsers(groupId) : []
	};
};
