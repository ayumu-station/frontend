import { fail } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const session = await locals.validate();
		if (session) {
			const form = await request.formData();
			const usertag = form.get('usertag')?.toString();
			const username = form.get('username')?.toString();
			const biography = form.get('biography')?.toString();
			if (
				typeof usertag !== 'string' ||
				usertag === '' ||
				typeof username !== 'string' ||
				username === '' ||
				(typeof biography !== 'string' && typeof biography !== 'undefined')
			)
				return fail(400);
			try {
				const user = await auth.updateUserAttributes(session.userId, {
					biography,
					usertag,
					username
				});
				return { user };
			} catch (e) {
				// return fail(400, { type: 'tagnotunique' });
				return fail(400);
			}
		} else fail(400);
	}
};
