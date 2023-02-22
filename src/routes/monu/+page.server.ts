/* eslint-disable @typescript-eslint/no-explicit-any */
import { Monu, User } from '$lib/server/db';
import { uploadImages } from '$lib/server/storage';
import { error, redirect, type Actions } from '@sveltejs/kit';
import { Blob } from 'buffer';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

const { VITE_WEBSOCKET_URL, WEBSOCKET_SECRET } = env;

export const load: PageServerLoad = async ({ locals, url: { searchParams } }) => {
	const session = await locals.validate();
	if (!session) throw redirect(307, '/login');

	const id = searchParams.get('id');
	const monu = id ? await Monu.get(id, session?.userId) : undefined;

	return { monu };
};

export const actions: Actions = {
	build: async ({ request, locals }) => {
		const session = await locals.validate();
		const formData = await request.formData();
		let type = formData.get('type')?.toString();
		const stringifyData = formData.get('data')?.toString();
		if (!session) {
			throw error(401, {
				message: 'Unauthorized'
			});
		} else if (!stringifyData) {
			throw error(400, {
				message: 'Bad Request'
			});
		} else {
			const images = formData.getAll('images');
			const data = JSON.parse(stringifyData) as {
				text: string;
				mention: string[];
				hashtag: string[];
			};
			if (
				(type !== undefined && type !== 'default' && type !== 'quote') ||
				!data.text ||
				!data.mention ||
				!data.hashtag ||
				typeof data.text !== 'string' ||
				!(data.mention instanceof Array) ||
				!(data.hashtag instanceof Array) ||
				!data.mention.every((i) => typeof i === 'string' && data.text.includes(`@${i}`)) ||
				!data.hashtag.every((i) => typeof i === 'string' && data.text.includes(`#${i}`)) ||
				!images ||
				!(images instanceof Array) ||
				!images.every((image) => image instanceof Blob) ||
				images.length > 4
			) {
				throw error(400, {
					message: 'Bad Request'
				});
			}
			if (!type) type = 'default';

			const parent = formData.get('parent')?.toString();
			const mentionSet = new Set(data.mention);
			try {
				const monu = await Monu.build(
					type as 'default' | 'quote',
					session.userId,
					data.text,
					parent,
					mentionSet,
					new Set(data.hashtag),
					images.length
				);
				await uploadImages(`monu/${monu.id}`, images as any, 2000, 2000);

				if (data.hashtag.length > 0)
					fetch(`https://${VITE_WEBSOCKET_URL}/event/mention`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', l: WEBSOCKET_SECRET },
						body: JSON.stringify({
							userTags: Array.from(mentionSet),
							byUserId: session.userId
						})
					});
				return { monu };
			} catch (e) {
				throw error(400, {
					message: '빌드에 실패했습니다.'
				});
			}
		}
	},
	remonu: async ({ request, locals }) => {
		const session = await locals.validate();
		const formData = await request.formData();
		const monuid = formData.get('monuid')?.toString();
		if (!session) {
			throw error(401, {
				message: 'Unauthorized'
			});
		} else if (!monuid) {
			throw error(400, {
				message: '올바르지 않은 데이터입니다.'
			});
		} else {
			try {
				const monu = await Monu.build('quote', session.userId, '', monuid);

				fetch(`https://${VITE_WEBSOCKET_URL}/event/remonu`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', l: WEBSOCKET_SECRET },
					body: JSON.stringify({
						userTags: [monu.parent?.usertag],
						byUserId: session.userId
					})
				});
				return { monu };
			} catch (e) {
				throw error(400, {
					message: '빌드에 실패했습니다.'
				});
			}
		}
	},
	getChilds: async ({ request, locals }) => {
		const session = await locals.validate();
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const cursor = data.get('cursor')?.toString();
		if (id) {
			const childs = await Monu.getChilds(id, cursor, session?.userId);
			return { childs };
		}
		return null;
	},
	like: async ({ request, locals }) => {
		const session = await locals.validate();
		if (!session) {
			throw error(401, {
				message: '막 접근하지 말아주세요...'
			});
		}
		const data = await request.formData();
		const id = session.userId;
		const monuid = data.get('monuid')?.toString();
		const like = data.get('like')?.toString();
		if (monuid !== undefined) {
			const res = await Monu.like(monuid, id, like ? true : false);
			if (like) {
				fetch(`https://${VITE_WEBSOCKET_URL}/event/like`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', l: WEBSOCKET_SECRET },
					body: JSON.stringify({
						userId: res.userId,
						byUserId: id
					})
				});
			}
			return { success: res.likedCount };
		}
	},
	gets: async ({ request, locals }) => {
		const session = await locals.validate();
		const data = await request.formData();
		const usertag = data.get('usertag')?.toString();
		const media = data.get('media')?.toString();
		const reply = data.get('reply')?.toString();
		const liked = data.get('liked')?.toString();
		if (!usertag) {
			throw error(400, {
				message: '올바른 값이 전달되지 않았습니다.'
			});
		} else {
			const cursor = data.get('c')?.toString();
			const id = session?.userId;
			const monus = liked
				? await User.getLikedMonus(usertag, id, cursor)
				: await User.getMonusByTag(usertag, id, Boolean(media), Boolean(reply), cursor);

			return { monus };
		}
	}
};
