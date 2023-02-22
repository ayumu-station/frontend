<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import MonuList from '$lib/components/Monu/List.svelte';
	import Controller from '$lib/controller/modal/monu';
	import MediaMonuList from '$lib/components/Monu/MediaList.svelte';
	import type { PageData } from './$types';
	import ScrollbarsController from '$lib/components/ScrollbarsController.svelte';
	export let data: PageData;
	let isLoading = true;
	let isEnded = false;
	let loadCount = 10;
	let manualLoad = false;

	beforeNavigate(() => {
		isLoading = true;
		loadCount = 10;
	});

	afterNavigate((e) => {
		isLoading = false;
		isEnded = false;
		if (data.user) {
			loadCount = data.monus.length;
		}
	});

	function onData(e: CustomEvent<any>) {
		data.monus = [...data.monus, ...e.detail.monus];
	}

	function fixMonu(monus: Client.SimpleMonu[], user: Client.SimpleUser) {
		return monus.map((simpleMonu) => ({
			...simpleMonu,
			image: user.image,
			username: user.username,
			usertag: user.usertag,
			userid: user.userid
		})) as Client.Monu[];
	}
</script>

{#if data.type === 'media'}
	<MediaMonuList monus={data.monus} />
{:else}
	<MonuList monus={data.monus} {loadCount} />
{/if}
<ScrollbarsController
	bind:isEnded
	bind:isLoading
	bind:loadCount
	bind:manualLoad
	type="deserialize"
	url="/monu?/gets"
	targetKey="monus"
	data={{
		usertag: data.user.usertag,
		c: data.monus.length > 0 ? data.monus[data.monus.length - 1].id : null,
		reply: data.type === 'with_replies' ? '1' : null,
		media: data.type === 'media' ? '1' : null,
		liked: data.type === 'likes' ? '1' : null
	}}
	on:data={onData}
/>
