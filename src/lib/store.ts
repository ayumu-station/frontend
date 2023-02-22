import { writable } from 'svelte/store';

function createToasts() {
	const { subscribe, set, update } = writable<Client.Toast[]>([]);

	const remove = (item: Client.Toast) => {
		update((i) => {
			const pos = i.indexOf(item);
			i.splice(pos, 1);
			return i;
		});
	};

	return {
		push: (item: Client.Toast) => {
			update((i) => [...i, item]);
			setTimeout(() => {
				remove(item);
			}, 3000);
		},
		remove,
		reset: () => {
			set([]);
		},
		subscribe
	};
}

export const toasts = createToasts();

export const prevUserTag = writable<string | undefined>(undefined);
export const ws = writable<WebSocket | undefined>(undefined);
export const wsConnected = writable(false);
export const messageGroups = writable<Client.MessageGroup[]>([]);
