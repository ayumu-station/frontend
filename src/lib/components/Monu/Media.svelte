<script lang="ts">
	import { afterUpdate, createEventDispatcher } from 'svelte';
	import Contoller from '$lib/controller/modal/monu';
	import { click } from '$lib/use';
	export let monu: Client.Monu;
	export let pos: number | undefined = undefined;

	let monuDiv: HTMLElement;
	let contentParent: HTMLDivElement;
	let footer: HTMLDivElement;
	let firstMedia:
		| {
				type: string;
				value: string;
		  }
		| undefined = undefined;

	afterUpdate(() => {
		const reg = /\[youtube]\((.*?)\)|\[image]\((.*?)\)/g;
		const firstMediaReg = monu.content.matchAll(reg).next();
		firstMedia = firstMediaReg.done
			? undefined
			: firstMediaReg.value[1]
			? { type: 'youtube', value: firstMediaReg.value[1] }
			: { type: 'image', value: firstMediaReg.value[2] };
	});

	const dispatch = createEventDispatcher();

	function mainClick(e: Event) {
		if (e.target === contentParent || e.target === footer || e.target === e.currentTarget) {
			if (monuDiv.parentElement !== null) {
				dispatch('click:main');
			}
		}
		childClick();
	}

	function childClick() {
		if (pos !== undefined) {
			Contoller.enabled.set(true);
			Contoller.monu.set(monu);
		}
	}
</script>

<article use:click={mainClick} bind:this={monuDiv} class="group parent">
	<!-- {#if firstMedia}
		<img
			src={firstMedia.type === 'image'
				? firstMedia.value
				: `https://img.youtube.com/vi/${firstMedia.value}/0.jpg`}
			alt="thumbnail"
			class="w-full object-cover aspect-square"
		/>
		{/if} -->
	<img
		src={`${import.meta.env.VITE_STORAGE_URL}/monu/${monu.id}/0.png`}
		alt="thumbnail"
		class="w-full object-cover aspect-square"
	/>
	<svg
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class="w-1/4 h-1/4 opacity-0 group-hover:opacity-100 m-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity z-20"
		use:click={childClick}
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
		/>
	</svg>
</article>

<style lang="scss">
	.parent {
		@apply flex flex-col p-1 relative gap-2 transition-all w-full;

		&::after {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			background: white;
			opacity: 0;
			z-index: 10;
			@apply transition-opacity;
		}

		&:hover::after {
			opacity: 0.3;
		}
	}
</style>
