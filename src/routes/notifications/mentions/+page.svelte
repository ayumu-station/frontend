<script lang="ts">
	import { goto } from '$app/navigation';
	import ScrollbarsController from '$lib/components/ScrollbarsController.svelte';
	import Image from '$lib/components/User/Image.svelte';
	import { click } from '$lib/use';
	import { getNotificationTitle } from '$lib/util';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	export let data: PageData;
	let isEnded = false;
	let isLoading = false;
	let loadCount = 10;
	let manualLoad = false;
	$: lastNotification = data.notifications
		? data.notifications[data.notifications.length - 1]
		: null;

	onMount(() => {
		loadCount = data.notifications.length;
		if (data.notifications.length < 10) isEnded = true;
	});

	function onData(e: CustomEvent<any>) {
		const res = e.detail;
		data.c = res.c;
		data.notifications = [...data.notifications, ...res.notifications];
	}
</script>

{#each data.notifications as notification}
	<article
		class="flex border-b p-2 items-center gap-2 hover:bg-slate-200 transition-colors"
		use:click={() => goto(`/monu/${notification.monuId}`)}
	>
		<Image
			type={notification.image}
			id={notification.userid}
			seed={notification.userid}
			size={14}
		/>
		<div class="flex flex-col">
			<p role="main">{getNotificationTitle(notification.type, notification.username)}</p>
			<p role="note">{notification.content}</p>
		</div>
	</article>
{/each}
<ScrollbarsController
	bind:isEnded
	bind:isLoading
	bind:loadCount
	bind:manualLoad
	on:data={onData}
	type="devalue"
	targetKey="notifications"
	data={{
		c: lastNotification
			? JSON.stringify([Number(lastNotification.created), lastNotification.monuId])
			: null
	}}
/>
