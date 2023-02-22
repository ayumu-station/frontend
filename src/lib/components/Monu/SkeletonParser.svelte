<script lang="ts">
	export let monu: Client.Monu;
	import Youtube from 'youtube-player';
	import { click } from '$lib/use';
	import SkeletonTextarea from '../Lexical/SkeletonTextarea.svelte';
	import { createEventDispatcher, type ComponentType, type SvelteComponentTyped } from 'svelte';
	const reg = /\[youtube]\((.*?)\)|\[image]\((.*?)\)/g;
	let mainDiv: HTMLDivElement;
	let playerDiv: HTMLDivElement;
	let player: ReturnType<typeof Youtube>;
	let isShowing = false;
	let isYoutubeReady = false;
	export let Textarea: ComponentType<
		SvelteComponentTyped<{ data?: Client.MonuData; editable?: boolean }>
	> = SkeletonTextarea;

	const dispatch = createEventDispatcher();

	$: {
		if (youtubeIds.length > 0 && playerDiv) {
			isYoutubeReady = false;
			player = Youtube(playerDiv, {
				playerVars: { rel: 0, modestbranding: 1, loop: 1 }
			});
			player.on('ready', () => {
				isYoutubeReady = true;
			});
			player.mute();
			if (youtubeIds.length === 1) {
				player.loadVideoById(youtubeIds[0]).then(onScroll);
			} else if (youtubeIds.length > 1) {
				player.loadPlaylist(youtubeIds).then(onScroll);
			}
		}
	}

	$: youtubeIds = [...monu.content.matchAll(reg)].map((i) => i[1]).filter((i) => i);
	$: imageUrls = [...monu.content.matchAll(reg)].map((i) => i[2]).filter((i) => i);
	$: tabLength = youtubeIds.length + imageUrls.length;
	let tabPos = 0;
	let isClicked = false;
	let isOvered = false;

	function nextTab() {
		if (tabPos < tabLength - 1) {
			tabPos++;
		}
	}

	function prevTab() {
		if (tabPos > 0) {
			tabPos--;
		}
	}

	function onScroll() {
		const bounding = mainDiv.getBoundingClientRect();
		isShowing = bounding.y > -bounding.height && bounding.y < bounding.height * 2; // todo CHECK RIGHT
	}
	$: {
		if (player) {
			if (isShowing) {
				dispatch('on:show');
				player.playVideo();
			} else {
				dispatch('off:show');
				player.pauseVideo();
			}
		}
	}

	$: {
		if (player && isClicked) {
			if (isOvered) {
				player.unMute();
			} else {
				player.mute();
			}
		}
	}
	let selectedImage = -1;

	// todo animate volume
	// let isChangingVolume = false;
	// function volume() {
	// 	player.getVolume().then((v) => {
	// 		isChangingVolume = true;
	// 		if (v >= 0 && v <= 100) {
	// 			player.setVolume(isOvered ? v + 1 : v - 1).then(volume);
	// 		} else isChangingVolume = false;
	// 	});
	// }
</script>

<div
	class="flex flex-col w-full relative"
	bind:this={mainDiv}
	on:focus={() => (isOvered = true)}
	on:mouseleave={() => (isOvered = false)}
>
	{#if tabLength > 0}
		<div
			class="w-full max-w-[640px] max-h-[360px] m-auto flex items-center bg-slate-200 rounded-xl overflow-hidden relative group"
		>
			{#if tabPos > 0}
				<div
					class="absolute left-0 top-0 z-20 w-1/4 h-full bg-gray-700 bg-opacity-30 flex opacity-0 hover:opacity-100 active:-left-4 transition-all"
					use:click={prevTab}
				>
					<p class="m-auto text-4xl select-none text-slate-200">
						{'<'}
					</p>
				</div>
			{/if}
			{#if tabPos < tabLength - 1}
				<div
					class="absolute right-0 top-0 z-20 w-1/4 h-full bg-gray-700 bg-opacity-30 flex opacity-0 hover:opacity-100 active:-right-4 transition-all"
					use:click={nextTab}
				>
					<p class="m-auto text-4xl select-none text-slate-200">
						{'>'}
					</p>
				</div>
			{/if}
			<div
				class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
			>
				<p>{tabPos + 1}/{tabLength}</p>
			</div>
			<div
				class={`w-full flex flex-shrink-0 transition-all relative h-full max-w-[640px] max-h-[360px] `}
				style="margin-left: -{100 * tabPos}%"
			>
				{#if youtubeIds.length > 0}
					{#if !isClicked}
						<div
							class="w-full h-full absolute z-30 left-0 top-0 bg-white bg-opacity-25 opacity-0 hover:opacity-100 transition-opacity flex"
						>
							<p class="m-auto">소리를 들으시려면 클릭해주세요.</p>
						</div>
					{/if}
					<div
						class={`w-full flex-shrink-0 transition-all relative ${
							isYoutubeReady ? '' : 'animate-pulse'
						}`}
						style="margin-left: -{100 * tabPos}%"
					>
						<div class="w-full" bind:this={playerDiv} />
					</div>
				{/if}
			</div>
		</div>
	{/if}
	<div
		class={`relative overflow-hidden rounded-lg max-w-md max-h-md m-auto grid gap-0.5 ${
			monu.imageCount === 1
				? 'grid-rows-1 grid-cols-1'
				: monu.imageCount === 2
				? 'grid-rows-1 grid-cols-2'
				: monu.imageCount === 3
				? 'grid-rows-2 grid-cols-2'
				: 'grid-rows-2 grid-cols-2'
		}`}
	>
		{#each Array(monu.imageCount) as _, i}
			<img
				src={`${import.meta.env.VITE_STORAGE_URL}/monu/${monu.id}/${i}.png`}
				alt="monu"
				class={`${
					monu.imageCount === 3 && i === 0 ? 'col-span-full' : ''
				} object-cover w-full h-full`}
				use:click={() => (selectedImage = i)}
			/>
		{/each}
	</div>
	{#if selectedImage >= 0}
		<img
			src={`${import.meta.env.VITE_STORAGE_URL}/monu/${monu.id}/${selectedImage}.png`}
			alt="monu"
			class="object-contain w-full h-full absolute left-0 top-0 bg-slate-500 bg-opacity-50 z-50 backdrop-blur-sm"
			use:click={() => (selectedImage = -1)}
		/>
	{/if}
	<svelte:component
		this={Textarea}
		editable={false}
		data={{
			hashtag: monu.hashtag,
			mention: monu.mention,
			text: monu.content
		}}
	/>
</div>
<svelte:window on:scroll={onScroll} use:click={() => (isClicked = true)} />
