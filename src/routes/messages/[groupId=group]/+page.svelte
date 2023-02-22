<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { messageGroups, ws, wsConnected } from '$lib/store';
	import { afterNavigate, goto } from '$app/navigation';
	import { Message } from '$lib/websocket';
	import UserSuggestion from '$lib/components/User/Suggestion.svelte';
	import Image from '$lib/components/User/Image.svelte';
	import Modal from '$lib/components/Modal/Modal.svelte';
	import MessageComponent from '$lib/components/Message/Message.svelte';
	import { tweened } from 'svelte/motion';
	import { quartInOut } from 'svelte/easing';
	import Scrollbars from '$lib/components/Scrollbars.svelte';
	import type { OverlayScrollbars, OnUpdatedEventListenerArgs } from 'overlayscrollbars';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import { getTimeString } from '$lib/util';
	import * as devalue from 'devalue';
	export let data: PageData;

	let messages: Client.Message[] = [];
	let stickBottom = true;
	let inputMessageValue = '';
	let inviteModalOpened = false;
	let userListDiv: HTMLDivElement;
	const userListOpened = tweened(0, {
		duration: 200,
		easing: quartInOut
	});
	let group: Client.MessageGroup;
	let events: (() => void)[] = [];
	let isLoading = false;
	let loadCount = 30;
	let isEnded = false;
	let overflowed = false;

	function getGroup() {
		const findGroup = $messageGroups.find(
			(group: Client.MessageGroup) => group.id == $page.params.groupId
		);
		if (findGroup) {
			group = findGroup;
		} else {
			goto('/messages');
		}
	}

	afterNavigate(() => {
		getGroup();
		messages = data.messages.reverse();
		loadCount = messages.length;
		if (messages.length < 30) isEnded = true;
	});

	onMount(() => {
		events.push(messageGroups.subscribe(getGroup));
		events.push(
			ws.subscribe((socket) => {
				if (socket) {
					socket.addEventListener('message', (e) => {
						const res = JSON.parse(e.data);
						switch (res.type) {
							case 'message':
								const msg = res.msg as Client.Message;
								if (res.groupId === group?.id) {
									messages.push(msg);
									messages = messages;
									if (msg.type === 1) {
										data.users.push(msg);
										data.users = data.usrs;
									} else if (msg.type === 2) {
										data.users = data.users.filter((user) => user.usertag !== msg.usertag);
									}
								}
								break;

							case 'createGroup':
								break;

							case 'inviteGroup':
								break;

							case 'leaveGroup':
								break;
						}
					});
				}
			})
		);
	});

	onDestroy(() => {
		for (let i = 0; i < events.length; i++) {
			events[i]();
		}
	});

	function onUpdated(
		e: CustomEvent<[instance: OverlayScrollbars, onUpdatedArgs: OnUpdatedEventListenerArgs]>
	) {
		const div = e.detail[0].elements().content;
		overflowed = e.detail[0].state().hasOverflow.y;
		if (stickBottom) {
			div.scrollTo(0, div.scrollHeight);
		}
	}

	function onSubmit(e: Event & { currentTarget: EventTarget & HTMLFormElement }) {
		if (inputMessageValue && inputMessageValue !== '') {
			Message.sendMessage(group.id, inputMessageValue);
			inputMessageValue = '';
		}
	}

	function onScroll(e: CustomEvent<[instance: OverlayScrollbars, event: Event]>) {
		const target = e.detail[1].target as HTMLDivElement;
		if (target.scrollTop < 10) {
			getMessages();
		}
		if (target.scrollHeight - (target.scrollTop + target.clientHeight) <= 10) {
			stickBottom = true;
		} else {
			stickBottom = false;
		}
	}

	function inviteClick() {
		inviteModalOpened = true;
	}

	function leaveClick() {
		Message.leaveGroup(group.id);
	}

	function inviteSubmit(e: CustomEvent<Client.SimpleUser>) {
		const user = e.detail;
		Message.inviteGroup(group.id, [user.usertag]);
	}

	function membersClick() {
		userListDiv.focus({ preventScroll: true });
		userListOpened.set(1);
	}

	async function getMessages() {
		if (!isLoading && !isEnded) {
			isLoading = true;
			loadCount += 30;
			const targetKey = 'messages';

			let res: Response;
			const searchParams = new URLSearchParams(window.location.search);
			searchParams.append('c', messages[0].id);
			res = await fetch(
				new URL(
					(window.location.pathname === '/' ? '' : window.location.pathname) +
						'/__data.json?' +
						searchParams.toString(),
					window.location.href
				)
			);

			const resText = await res.text();
			let responseJSON: { [id: string]: any } = {};

			const json = JSON.parse(resText);
			if (json.type === 'data') {
				const nodes = json.nodes;
				for (let i = 0; i < nodes.length; i++) {
					const node = nodes[i];
					if (node && node.type === 'data') {
						responseJSON = { ...responseJSON, ...devalue.parse(JSON.stringify(node.data)) };
					}
				}
			} else new Error('Invalid Data');

			isLoading = false;
			loadCount += responseJSON[targetKey].length - 30;
			if (responseJSON[targetKey].length < 30) isEnded = true;
			messages = [...responseJSON[targetKey].reverse(), ...messages];

			tick().then(() => {
				if (overflowed) getMessages();
			});
		}
	}
</script>

{#if group}
	<div class="flex flex-col w-full h-full relative">
		<div class="title">
			<a href="/messages">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
					/>
				</svg>
			</a>
			<p>{group.title ? group.title : '제목 없음'}</p>
			<a href={`/messages/edit/${group.id}`}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
					/>
				</svg>
			</a>
			<button on:click={inviteClick}
				><svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
					/>
				</svg>
			</button>
			<button on:click={membersClick}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
					/>
				</svg>
			</button>
			<button on:click={leaveClick}
				><svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
					/>
				</svg>
			</button>
		</div>
		<div class="flex flex-col overflow-y-hidden h-full">
			<div class="flex-1" />
			<Scrollbars on:osScroll={onScroll} on:osUpdated={onUpdated}>
				{#each messages as message, i}
					{#if i === 0 || new Date(Number(message.created)).getDate() - new Date(Number(messages[i - 1].created)).getDate() >= 1}
						<div class="flex items-center px-2">
							<div class="flex-1 h-0.5 bg-slate-200" />
							<p class="text-slate-400 text-sm">
								{getTimeString(message.created, true).date}
							</p>
							<div class="flex-1 h-0.5 bg-slate-200" />
						</div>
					{/if}
					<MessageComponent {message} />
				{/each}
			</Scrollbars>
		</div>
		<form on:submit|preventDefault={onSubmit} class="m-2 p-2 bg-slate-100 rounded-lg flex">
			<input
				disabled={!$wsConnected}
				type="text"
				placeholder={$wsConnected ? '새 메시지 작성하기' : '서버와 연결되어있지 않습니다.'}
				id="message"
				name="message"
				class="w-full bg-transparent"
				bind:value={inputMessageValue}
			/>
			<button
				type="submit"
				disabled={inputMessageValue === '' || !$wsConnected}
				class={inputMessageValue === '' ? 'opacity-50' : ''}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-5 h-5"
				>
					<path
						d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z"
					/>
				</svg>
			</button>
		</form>
		<div
			class="absolute top-0 bg-gray-50 h-full w-52"
			style={`right: ${($userListOpened - 1) * 100}%;`}
			tabindex="-1"
			bind:this={userListDiv}
			on:focusout={() => userListOpened.set(0)}
		>
			<Scrollbars>
				<div class="flex flex-col gap-2 p-3">
					<p>사용자 - {data.users.length}</p>
					{#each data.users as user}
						<div class="flex gap-2">
							<Image type={user.image} id={user.userid} size={11} seed={user.userid} />
							<div class="flex flex-col">
								<p>{user.username}</p>
								<p class="text-sm">@{user.usertag}</p>
							</div>
						</div>
					{/each}
				</div>
			</Scrollbars>
		</div>
	</div>
	{#if inviteModalOpened}
		<Modal on:backdropClick={() => (inviteModalOpened = false)}>
			<UserSuggestion
				on:submit={inviteSubmit}
				input={true}
				excludeUsertag={data.users.map((user) => user.usertag)}
			/>
		</Modal>
	{/if}
{/if}

<style lang="scss">
	.title {
		@apply flex p-2 items-center gap-2;
		& > p {
			@apply flex-1 text-xl font-medium;
		}
	}
</style>
