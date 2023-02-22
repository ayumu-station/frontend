import type { PageServerLoad } from './$types';
import { Monu, Notification } from '$lib/server/db';
import { listBuckets } from '$lib/server/storage';

export const load: PageServerLoad = async ({ locals, url: { searchParams } }) => {
	const session = await locals.validate();
	let c1 = searchParams.get('c1');
	let c2 = searchParams.get('c2');
	let monus: Client.MonuNotification[] = [];
	// if (session.session) {
	// 	const res = await Notification.getWithMonu(session.user.userid, c2);
	// 	if (res.length > 0) {
	// 		c2 = res[res.length - 1].notiId;
	// 		monus = res;
	// 	} else c2 = null;
	// }

	const base = await Monu.getRecent(c1, session?.userId);
	c1 = base.length > 0 ? base[base.length - 1].id : null;
	// const fixBase = base.map((b) => ({
	// 	type: 'newMonu',
	// 	...b
	// })) as Client.MonuNotification[];
	// monus = [...monus, ...fixBase];
	monus = [...monus, ...base];

	const ids: Set<string> = new Set([]);
	monus = monus.filter((v) => {
		if (!ids.has(v.id)) {
			ids.add(v.id);
			return true;
		}
	});

	// monus = monus.sort((a, b) => b.likedCount - a.likedCount);

	// shuffle array https://stackoverflow.com/a/12646864
	for (let i = monus.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[monus[i], monus[j]] = [monus[j], monus[i]];
	}

	return { monus, c1, c2 };
};
