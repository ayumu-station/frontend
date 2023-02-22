<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import Build from '$lib/components/Monu/Build.svelte';
	import MonuList from '$lib/components/Monu/List.svelte';
	import ScrollbarsController from '$lib/components/ScrollbarsController.svelte';
	export let data: PageData;
	const user = getUser();
	let isEnded = false;
	let isLoading = false;
	let loadCount = 10;
	let manualLoad = false;

	onMount(() => {
		loadCount = data.monus.length;
		if (data.monus.length < 10) isEnded = true;
	});

	function onData(e: CustomEvent<any>) {
		const res = e.detail;
		data.c1 = res.c1;
		data.c2 = res.c2;
		data.monus = [...data.monus, ...res.monus];
	}

	function onSubmit(e: CustomEvent<{ monu: Client.Monu }>) {
		data.monus = [{ ...e.detail.monu, type: 'newMonu' }, ...data.monus];
		loadCount = data.monus.length;
	}
</script>

<svelte:head>
	<title>STATION</title>
</svelte:head>
<div>
	{#if $user}
		<Build opened={true} on:submit={onSubmit} />
	{/if}
	<MonuList monus={data.monus} {loadCount} />
	{#if data.monus.length === 0}
		<p>NO CONTENT</p>
	{/if}
</div>
<ScrollbarsController
	bind:isEnded
	bind:isLoading
	bind:loadCount
	bind:manualLoad
	on:data={onData}
	type="devalue"
	targetKey="monus"
	data={{ c1: data.c1, c2: data.c2 }}
/>
