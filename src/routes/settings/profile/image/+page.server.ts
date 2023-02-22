import { fail } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { Actions } from './$types';
import { deleteImage, uploadImage } from '$lib/server/storage';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const session = await locals.validate();
		if (session) {
			const form = await request.formData();
			const image = form.get('image');
			if (image !== null && !(image instanceof Blob)) return fail(400);
			image === null
				? await deleteImage(`u/${session.userId}`)
				: await uploadImage(`u/${session.userId}`, image as any, 500, 500);
			const user = await auth.updateUserAttributes(session.userId, {
				image: image === null ? 0 : 1
			});
			return { user };
		} else fail(400);
	}
};
