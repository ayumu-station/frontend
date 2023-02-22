import { writable } from 'svelte/store';

const emptyMonu: Client.Monu = {
	content: '',
	id: '',
	created: BigInt(0),
	liked: false,
	likedCount: 0,
	username: '',
	usertag: '',
	hashtag: [],
	mention: [],
	image: 0,
	imageCount: 0,
	userid: '',
	parent: undefined,
	top: undefined
};

export const enabled = writable(false);
export const monu = writable<Client.Monu>(emptyMonu);
export const target = writable<HTMLElement | undefined>(undefined);

export default { enabled, monu, target };
