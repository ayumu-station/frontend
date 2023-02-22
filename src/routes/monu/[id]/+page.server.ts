import { Monu } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params: { id }, locals }) => {
	const session = await locals.validate();
	const monu = await Monu.get(id, session?.userId);
	const childs = await Monu.getChilds(id, null, session?.userId);

	return { monu, childs };
};
