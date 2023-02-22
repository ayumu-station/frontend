<script lang="ts">
	import { click } from '$lib/use';
	import { createEventDispatcher, onMount } from 'svelte';
	export let list: Client.Hashtag[] = [];
	export let selected = 0;
	export let isSuggestionLoading = false;

	const dispatch = createEventDispatcher();
	export let value = '';
	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	$: {
		if (mounted) suggestion(value);
	}

	function suggestion(v: string) {
		dispatch('request:suggestion', v);
	}

	function submit(hashtag: Client.Hashtag) {
		dispatch('submit', hashtag);
	}
</script>

<div class="flex flex-col">
	{#each list as hashtag, i}
		<div
			class={`flex items-center gap-2 border-b p-2 ${i === selected ? 'bg-slate-400' : ''}`}
			use:click={() => submit(hashtag)}
			role="suggestion"
		>
			<p>#{hashtag.name}</p>
			<p class="text-sm">{hashtag.count}개</p>
		</div>
	{/each}
</div>
