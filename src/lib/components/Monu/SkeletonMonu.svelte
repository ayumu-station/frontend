<script lang="ts">
	import type { SvelteComponentTyped, ComponentType } from 'svelte';
	import { tempMonu } from '$lib/util';
	import SkeletonParser from './SkeletonParser.svelte';
	import SingleMonu from './SingleMonu.svelte';
	export let monu: Client.Monu = tempMonu();
	export let pos: number | undefined = undefined;
	export let loaded = false;
	export let comments = true;
	export let Parser: ComponentType<SvelteComponentTyped<any>> = SkeletonParser;
	export let parent: Client.Monu | undefined = undefined;
</script>

<div class="p-4">
	{#if monu.type === 0}
		{#if monu.top && monu.parent && monu.parent.id !== monu.top.id}
			<SingleMonu
				monu={monu.top}
				{loaded}
				{Parser}
				type="top"
				on:click:child
				on:click:main
				on:click:profile
				on:click:like
				on:click:share
				on:click:remonu
				on:click:quote
			/>
		{/if}
		{#if monu.parent && (parent ? monu.parent.id !== parent.id : true)}
			<SingleMonu
				monu={monu.parent}
				{loaded}
				{Parser}
				type="parent"
				on:click:child
				on:click:main
				on:click:profile
				on:click:like
				on:click:share
				on:click:remonu
				on:click:quote
			/>
		{/if}
	{/if}
	<SingleMonu
		{monu}
		{comments}
		{loaded}
		{Parser}
		on:click:child
		on:click:main
		on:click:profile
		on:click:like
		on:click:share
		on:click:remonu
		on:click:quote
	/>
</div>
