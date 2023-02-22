<script lang="ts">
	import { beforeUpdate, createEventDispatcher, onMount } from 'svelte';

	export let value = '';
	export let isFilled = false;
	export let editable = false;
	let inputs: string[] = ['', '', '', '', '', ''];
	let div: HTMLDivElement;
	let mounted = false;

	const dispatch = createEventDispatcher();

	beforeUpdate(() => {
		if (value.length === 6) inputs = value.split('');
		inputs = inputs.map((i) => i.toUpperCase());
	});

	onMount(() => {
		mounted = true;
	});

	function onKeydown(e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		const { children } = div;
		let pos = -1;
		for (let i = 0; i < children.length; i++) {
			const child = children[i] as HTMLInputElement;
			if (child === e.currentTarget) {
				const isNext = inputs[i].length === 1;
				if (isNext) pos = i + 1;
				else if (!isNext && e.key === 'Backspace') pos = i - 1;
				break;
			}
		}
		if (pos >= 0 && pos < children.length) (children[pos] as HTMLInputElement).focus();
	}

	$: {
		if (mounted) {
			isFilled = inputs.every((input) => input.length === 1);
			value = isFilled ? inputs.join('') : '';

			if (isFilled) {
				dispatch('submit', value.toUpperCase());
			}
		}
	}
</script>

<input type="hidden" name="buildcode" {value} />
<div bind:this={div}>
	{#each Array(6) as _, i}
		<input
			type="text"
			bind:value={inputs[i]}
			maxlength="1"
			on:keydown={onKeydown}
			required
			disabled={!editable}
		/>
	{/each}
</div>

<style lang="scss">
	div {
		@apply flex gap-1 w-64;

		& > * {
			@apply border-2 w-1/6 h-full text-4xl text-center rounded-lg;
		}
	}
</style>
