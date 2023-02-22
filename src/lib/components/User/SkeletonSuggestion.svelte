<script lang="ts">
	import { click } from '$lib/use';
	import { createEventDispatcher, onMount } from 'svelte';
	import Image from './Image.svelte';

	export let isSuggestionLoading = false;
	export let list: Client.SimpleUser[] = [];
	export let selected = 0;
	export let value = '';
	export let input = false;

	const dispatch = createEventDispatcher();
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

	function submit(user: Client.SimpleUser) {
		dispatch('submit', user);
	}

	function onKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				selected++;
				if (selected >= list.length) selected = 0;
				break;

			case 'ArrowUp':
				e.preventDefault();
				selected--;
				if (selected < 0) selected = list.length - 1;
				break;

			case 'Enter':
				e.preventDefault();
				if (list.length > 0) submit(list[selected]);
				break;

			default:
				break;
		}
	}
</script>

{#if input}
	<input type="text" placeholder="추가할 유저태그" bind:value on:keydown={onKeyDown} />
{/if}
<div class="flex flex-col">
	{#each list as user, i}
		<div
			class={`flex items-center gap-2 border-b p-2 ${i === selected ? 'bg-slate-400' : ''}`}
			use:click={() => submit(user)}
			role="suggestion"
		>
			<Image type={user.image} id={user.userid} size={14} seed={user.userid} />
			<p>{user.username}</p>
			<p class="text-sm">@{user.usertag}</p>
		</div>
	{/each}
</div>
