import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { PageServerLoad, Actions } from './$types';
import { BuildCode } from '$lib/server/db';

// If the user exists, redirect authenticated users to the profile page.
export const load: PageServerLoad = async ({ locals, url: { searchParams } }) => {
	const session = await locals.validate();
	if (session) throw redirect(302, '/');
	const buildCode = searchParams.get('bc');
	let codePassed = false;
	if (buildCode) {
		const checkCode = await BuildCode.getBuildCode(buildCode);
		codePassed = Boolean(checkCode);
	}
	return { codePassed };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const usertag = form.get('usertag');
		const username = form.get('username');
		const password = form.get('password');
		const buildCode = form.get('buildcode');

		// check for empty values
		if (
			!buildCode ||
			!usertag ||
			!username ||
			!password ||
			typeof usertag !== 'string' ||
			typeof username !== 'string' ||
			typeof password !== 'string' ||
			typeof buildCode !== 'string'
		) {
			return fail(400);
		}
		const checkCode = await BuildCode.getBuildCode(buildCode);
		if (!checkCode) return fail(400);
		try {
			const user = await auth.createUser({
				key: {
					providerId: 'usertag',
					providerUserId: usertag,
					password
				},
				attributes: {
					usertag,
					username
				}
			});
			const session = await auth.createSession(user.userid);
			locals.setSession(session);
		} catch {
			// username already in use
			return fail(400);
		}
	}
};
