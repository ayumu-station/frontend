<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Group from '$lib/components/Message/Group.svelte';
	import { messageGroups, ws } from '$lib/store';
	import type { Message } from '$lib/websocket';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	export let data: LayoutData;
	let bodyIneerWidth = 0;
	const currentUser = getUser();
	let param = '';

	afterNavigate(() => {
		param = location.pathname.split('/')[2];
	});

	onMount(() => {
		messageGroups.set(data.groups);
		return ws.subscribe((socket) => {
			if (socket) {
				socket.addEventListener('message', (e) => {
					const res = JSON.parse(e.data);
					switch (res.type) {
						case 'message':
							const msg = res.msg as Client.Message;
							messageGroups.update((groups) => {
								const group = groups.find((group) => group.id === res.groupId);
								if (group) {
									group.latestMessage = msg.content;
									group.updated = msg.created;
									groups.sort((a, b) => {
										const aDate = a.updated ? a.updated : a.created;
										const bDate = b.updated ? b.updated : b.created;
										return Number(bDate) - Number(aDate);
									});
								}
								return groups;
							});
							break;

						case 'createGroup':
							const createdGroup = res.data as Awaited<ReturnType<typeof Message.createGroup>>;
							messageGroups.update((groups) => [createdGroup, ...groups]);
							break;

						case 'inviteGroup':
							const invitedGroup = res.data as Awaited<ReturnType<typeof Message.inviteGroup>>;
							data.groups = [invitedGroup, ...data.groups];
							messageGroups.set(data.groups);
							break;

						case 'leaveGroup':
							const { groupId } = res.data as Awaited<ReturnType<typeof Message.leaveGroup>>;
							messageGroups.update((groups) =>
								groups.filter((msgGroup) => msgGroup.id !== groupId)
							);
							break;

						case 'modifyGroup':
							const modifiedGroup = res.data as Awaited<ReturnType<typeof Message.modifyGroup>>;
							messageGroups.update((groups) => {
								const group = groups.find((group) => group.id === modifiedGroup.groupId);
								if (group) {
									if (modifiedGroup.title) group.title = modifiedGroup.title;
									if (modifiedGroup.image !== null) group.image = modifiedGroup.image;
								}
								return groups;
							});
							break;

						default:
							break;
					}
				});
			}
		});
	});

	$: overflowed = bodyIneerWidth <= 690;
</script>

<div class={`grid h-[calc(100vh-80px)] w-full ${overflowed ? '' : 'grid-cols-3'}`}>
	{#if !overflowed || (overflowed && !$page.params.groupId && !(param === 'new'))}
		<div class="flex flex-col border-r overflow-hidden">
			<div class="flex p-3">
				<p class="text-xl font-medium">메시지</p>
				<a class="ml-auto" href="/messages/new"
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
							d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"
						/>
					</svg>
				</a>
			</div>
			{#each $messageGroups as group}
				<Group
					{group}
					on:click={() => goto(`/messages/${group.id}`)}
					selected={$page.params.groupId === group.id}
				/>
			{/each}
		</div>
	{/if}
	{#if $page.params.groupId || param === 'new' || !overflowed}
		<div class="col-span-2 h-full overflow-hidden">
			<slot />
		</div>
	{/if}
</div>
<svelte:window bind:innerWidth={bodyIneerWidth} />
