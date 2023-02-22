import { nanoid } from 'nanoid';
import { get } from 'svelte/store';
import { ws } from './store';

export const Message = {
	sendMessage(groupId: string, msg: string) {
		const socket = get(ws);
		if (socket) {
			socket.send(
				JSON.stringify({
					id: '',
					type: 'sendMessage',
					data: { groupId, msg }
				})
			);
		}
	},
	createGroup(title: string, image: string, userTags: string[] = []) {
		return new Promise<Client.MessageGroup>((resolve, reject) => {
			const socket = get(ws);
			if (socket) {
				const id = nanoid();
				const event = (e: MessageEvent) => {
					const res = JSON.parse(e.data);
					if (res.id === id) {
						socket.removeEventListener('message', event);
						if (res.type === 'createGroup') {
							resolve(res.data);
						} else {
							reject();
						}
					}
				};
				socket.addEventListener('message', event);
				socket.send(
					JSON.stringify({
						id,
						type: 'createGroup',
						data: { title, userTags, image }
					})
				);
			}
		});
	},
	modifyGroup(groupId: string, title: string | null = null, image: string | null = null) {
		return new Promise<{ title: string | null; image: 0 | 1 | null; groupId: string }>(
			(resolve, reject) => {
				const socket = get(ws);
				if (socket) {
					const id = nanoid();
					const event = (e: MessageEvent) => {
						const res = JSON.parse(e.data);
						if (res.id === id) {
							socket.removeEventListener('message', event);
							if (res.type === 'modifyGroup') {
								resolve(res.data);
							} else {
								reject();
							}
						}
					};
					socket.addEventListener('message', event);
					socket.send(
						JSON.stringify({
							id,
							type: 'modifyGroup',
							data: { groupId, image, title }
						})
					);
				}
			}
		);
	},
	inviteGroup(groupId: string, userTags: string[] = []) {
		return new Promise<Client.MessageGroup>((resolve, reject) => {
			const socket = get(ws);
			if (socket) {
				const id = nanoid();
				const event = (e: MessageEvent) => {
					const res = JSON.parse(e.data);
					if (res.id === id) {
						socket.removeEventListener('message', event);
						if (res.type === 'inviteGroup') {
							resolve(res.data);
						} else {
							reject();
						}
					}
				};
				socket.addEventListener('message', event);
				socket.send(
					JSON.stringify({
						id,
						type: 'inviteGroup',
						data: { groupId, userTags }
					})
				);
			}
		});
	},
	leaveGroup(groupId: string) {
		return new Promise<{ groupId: string }>((resolve, reject) => {
			const socket = get(ws);
			if (socket) {
				const id = nanoid();
				const event = (e: MessageEvent) => {
					const res = JSON.parse(e.data);
					if (res.id === id) {
						socket.removeEventListener('message', event);
						if (res.type === 'leaveGroup') {
							resolve(res.data);
						} else {
							reject();
						}
					}
				};
				socket.addEventListener('message', event);
				socket.send(
					JSON.stringify({
						id,
						type: 'leaveGroup',
						data: { groupId }
					})
				);
			}
		});
	}
};
