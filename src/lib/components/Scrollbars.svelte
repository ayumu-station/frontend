<script lang="ts">
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
	export let root: HTMLElement | null = null;
	let getElement: (() => HTMLElement | null) | undefined = undefined;
	$: {
		if (getElement) root = getElement();
	}
</script>

<OverlayScrollbarsComponent
	options={{ scrollbars: { autoHide: 'scroll' } }}
	bind:getElement
	on:osDestroyed
	on:osInitialized
	on:osScroll
	on:osUpdated
>
	<slot />
</OverlayScrollbarsComponent>

<style>
	:global(div[data-overlayscrollbars='host']) {
		height: 100%;
	}

	:global(.os-scrollbar-handle) {
		background: rgba(0, 0, 0, 0.5) !important;
	}

	:global(.os-scrollbar-vertical) {
		width: 6px !important;
	}
</style>
