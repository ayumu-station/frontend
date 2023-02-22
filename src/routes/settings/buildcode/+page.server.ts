/* eslint-disable @typescript-eslint/no-explicit-any */
import { BuildCode } from '$lib/server/db';
import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.validate();
	if (!session) throw redirect(307, '/login');

	const canCreate = await BuildCode.checkCanCreate(session.userId);

	const buildCodes = canCreate ? await BuildCode.getBuildCodesByUser(session.userId) : [];

	return { canCreate, buildCodes };
};

export const actions: Actions = {
	create: async ({ locals }) => {
		const session = await locals.validate();
		if (!session) throw error(401);

		const canCreate = BuildCode.checkCanCreate(session.userId);
		if (!canCreate) throw error(401);

		const buildCode = await BuildCode.createBuildCode(session.userId);
		return { buildCode };
	},
	delete: async ({ request, locals }) => {
		const session = await locals.validate();
		if (!session) throw error(401);

		const canCreate = BuildCode.checkCanCreate(session.userId);
		if (!canCreate) throw error(401);

		const form = await request.formData();
		const buildcode = form.get('buildcode');

		if (!buildcode || typeof buildcode !== 'string') throw error(400);
		try {
			await BuildCode.deleteBuildCode(buildcode);
		} catch (e) {
			throw error(400);
		}
	}
};
