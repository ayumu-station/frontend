import { fail } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const session = await locals.validate();
		if (session) {
			const form = await request.formData();
			const password = form.get('password');
			if (!password || typeof password !== 'string') return fail(400);
			try {
				const user = await auth.updateUserPassword(session.userId, password);
				await auth.invalidateAllUserSessions(user.userid);
				const newSession = await auth.createSession(user.userid);
				locals.setSession(newSession);
				return { user };
			} catch (e) {
				return fail(400);
			}
		} else fail(400);
	}
};
