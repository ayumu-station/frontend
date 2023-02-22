<script lang="ts">
	import { deserialize } from '$app/forms';
	import Build from '$lib/components/Monu/Build.svelte';
	import List from '$lib/components/Monu/List.svelte';
	import Monu from '$lib/components/Monu/Monu.svelte';
	import ScrollbarsController from '$lib/components/ScrollbarsController.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	export let data: PageData;
	let isLoading = false;
	let isEnded = false;
	let loadCount = 10;

	onMount(() => {
		if (data.monu !== null) {
			loadCount = data.childs.length;
		}
	});

	const onSubmit = (e: CustomEvent<any>) => {
		if (data.monu) {
			const monu = e.detail.monu as Client.Monu;
			data.childs.splice(0, 0, monu);
			data.childs = data.childs;
			loadCount += 1;
		}
	};

	function onScroll() {
		if (data.monu) {
			isLoading = true;
			loadCount += 10;
			const formData = new FormData();
			formData.append('id', data.monu.id);
			formData.append('cursor', data.child[data.child.length - 1].id);
			fetch('/monu?/getChilds', {
				method: 'POST',
				body: formData
			}).then((res) => {
				res.text().then((res) => {
					const result = deserialize(res);
					if (result.type === 'success' && result.data !== undefined && data.monu) {
						const resChilds: Client.Monu[] = result.data.childs;
						data.childs = [...data.childs, ...resChilds];
						loadCount = data.childs.length;
						isLoading = false;
						if (resChilds.length < 10) isEnded = true;
					}
				});
			});
		}
	}

	function onData(e: CustomEvent<any>) {
		const resChilds = e.detail.childs;
		data.childs = [...data.childs, ...resChilds];
		// monus.set([data.monu, ...data.childs]);
	}
</script>

<div class="flex flex-col">
	{#if data.monu}
		<Monu monu={data.monu} comments={false} loaded={true} />
		<Build parentMonu={data.monu} on:submit={onSubmit} />
		<div class="w-full brder-b-2 h-4" />
		<List monus={data.childs} {loadCount} />
	{:else}
		<p>존재하지 않는 MONU</p>
	{/if}
</div>
<ScrollbarsController
	on:data={onData}
	bind:isLoading
	bind:isEnded
	targetKey="childs"
	type="deserialize"
	data={{
		id: data.monu.id,
		cursor: data.childs.length > 0 ? data.childs[data.childs.length - 1].id : null
	}}
	url="/monu?/getChilds"
/>
