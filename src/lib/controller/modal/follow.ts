import { writable } from 'svelte/store';

export const enabled = writable(false);
export const options = writable<{
	type: 'follower' | 'following';
	user: Client.User | undefined;
}>({
	type: 'follower',
	user: undefined
});

export default { enabled, options };
