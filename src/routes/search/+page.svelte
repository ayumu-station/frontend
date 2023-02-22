<script lang="ts">
	import type { PageData } from './$types';
	import Loading from '$lib/components/Loading.svelte';
	import { afterNavigate } from '$app/navigation';
	import MonuList from '$lib/components/Monu/List.svelte';
	import ScrollbarsController from '$lib/components/ScrollbarsController.svelte';
	export let data: PageData;
	let isEnded = false;
	let isLoading = false;
	let p = '';
	let loadCount = 10;
	let manualLoad = false;

	afterNavigate(() => {
		loadCount = data.monus.length;
		if (data.monus.length < 10) isEnded = true;
		// tick().then(() => {
		// if (!$overflowed) manualLoad = true;
		// });
	});

	function onData(e: CustomEvent<any>) {
		const newMonus = e.detail.monus as Client.Monu[];
		data.monus = [...data.monus, ...newMonus];
	}
</script>

<svelte:head>
	<title>STATION : {p}</title>
</svelte:head>
<div class="max-w-default m-auto flex flex-col gap-3">
	<!-- <div class="border ml-6 mr-6">
		{#each $monus as monu, i}
			<div class="relative border-b">
				<Monu {monu} pos={i} />
			</div>
		{/each}
		
	</div> -->
	{#if data.hashtag}
		<div class="px-5 flex flex-col">
			<p class="text-xl font-semibold text-blue-500">#{data.hashtag.name}</p>
			<p>{data.hashtag.count}개</p>
		</div>
	{/if}
	<MonuList monus={data.monus} {loadCount} />
	{#if isLoading}
		<Loading />
	{/if}
</div>
<ScrollbarsController
	on:data={onData}
	bind:isLoading
	bind:isEnded
	bind:loadCount
	bind:manualLoad
	type="devalue"
	targetKey="monus"
	data={{ c: data.monus.length > 0 ? data.monus[data.monus.length - 1].id : null }}
/>
