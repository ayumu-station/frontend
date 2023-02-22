import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { PageServerLoad, Actions } from './$types';
import type { Key } from 'lucia-auth';

// If the user exists, redirect authenticated users to the profile page.
export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.validate();
	if (session) throw redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const usertag = form.get('usertag');
		const password = form.get('password');
		// check for empty values
		if (!usertag || !password || typeof usertag !== 'string' || typeof password !== 'string')
			return fail(400);
		try {
			const key = (await auth.validateKeyPassword('usertag', usertag, password)) as unknown as Key;
			const session = await auth.createSession(key.userId);
			locals.setSession(session);
		} catch {
			// invalid credentials
			return fail(400);
		}
	}
};
