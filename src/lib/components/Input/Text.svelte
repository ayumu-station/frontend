<script lang="ts">
	import { cubicInOut } from 'svelte/easing';

	export let title: string;
	export let id: string;
	export let prefix = '';
	export let value = '';
	export let type: 'text' | 'password' = 'text';
	let focused = false;

	function focus(node: Element) {
		return {
			delay: 0,
			duration: 300,
			css: (t: number) => `
					width: ${100 * t}%; 
					`,
			easing: cubicInOut
		};
	}

	function onFocus(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		focused = document.activeElement === e.currentTarget;
	}

	function typeAction(node: HTMLInputElement) {
		// https://stackoverflow.com/a/71193441
		node.type = type;
	}
</script>

<div>
	<div
		class="h-0.5 transition-wh rounded-full bg-gradient-to-r from-main to-lime-500"
		class:w-0={!focused}
		class:w-full={focused}
		transition:focus
	/>
	<label for={id}>{title}</label>
	<div class="flex items-center gap-1 mt-1">
		{#if prefix !== ''}
			<label for={id}>{prefix}</label>
		{/if}
		<input
			use:typeAction
			{id}
			name={id}
			class="w-full border-b-2 transition-colors outline-none"
			class:border-slate-700={!focused}
			class:border-main={focused}
			bind:value
			on:focusin={() => (focused = true)}
			on:focusout={() => (focused = false)}
		/>
	</div>
</div>
