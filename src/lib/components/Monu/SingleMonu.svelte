<script lang="ts">
	import { click } from '$lib/use';
	import { createEventDispatcher, SvelteComponentTyped, type ComponentType } from 'svelte';
	import Image from '$lib/components/User/Image.svelte';
	import { getTimeString, tempMonu } from '$lib/util';
	import SkeletonParser from './SkeletonParser.svelte';
	import { fade, fly } from 'svelte/transition';
	import QuoteMonu from './QuoteMonu.svelte';
	export let monu: Client.Monu = tempMonu();
	export let pos: number | undefined = undefined;
	export let loaded = false;
	export let comments = true;
	export let Parser: ComponentType<SvelteComponentTyped<any>> = SkeletonParser;
	export let type: 'default' | 'parent' | 'top' = 'default';

	export let monuDiv: HTMLElement | undefined = undefined;
	let contentParent: HTMLDivElement;
	let footer: HTMLDivElement;
	let quoteClicked = false;
	let quoteDiv: HTMLDivElement;
	$: date = getTimeString(monu.created);

	const dispatch = createEventDispatcher();

	function mainClick(e: Event) {
		if (
			loaded &&
			(e.target === contentParent || e.target === footer || e.target === e.currentTarget)
		) {
			if (monuDiv && monuDiv.parentElement !== null) {
				dispatch('click:main', { monu, monuDiv });
			}
		}
	}

	function profileClick() {
		if (loaded) {
			dispatch('click:profile', { monu, monuDiv });
		}
	}

	function likeClick() {
		if (loaded) {
			dispatch('click:like', { monu, monuDiv });
		}
	}

	function childClick() {
		if (loaded) {
			dispatch('click:child', { monu, monuDiv });
		}
	}

	function shareClick() {
		if (loaded) {
			dispatch('click:share', { monu, monuDiv });
		}
	}

	function reMonuClick() {
		if (loaded) {
			quoteClicked = false;
			dispatch('click:remonu', { monu, monuDiv });
		}
	}

	function quoteClick() {
		if (loaded) {
			quoteClicked = false;
			dispatch('click:quote', { monu, monuDiv });
		}
	}

	function onBodyClick(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		const childs = quoteDiv.querySelectorAll('*');
		const childsArray: Element[] = [];
		for (let i = 0; i < childs.length; i++) {
			const child = childs[i];
			childsArray.push(child);
		}
		if (e.target && childsArray.indexOf(e.target as Element) === -1) {
			quoteClicked = false;
		}
	}
</script>

<div
	class={`flex w-full gap-2 m-auto relative transition-all ${loaded ? '' : 'animate-pulse'}`}
	use:click={mainClick}
	bind:this={monuDiv}
	role={loaded ? 'article' : ''}
	in:fly={{ y: 50, duration: 100, delay: 100 * (pos ? pos % 10 : 0) }}
>
	<div class="flex flex-col">
		<div use:click={profileClick}>
			{#if loaded}
				<Image type={monu.image} id={monu.userid} seed={monu.userid} />
			{:else}
				<Image type={0} id="" seed="" />
			{/if}
		</div>
		<div class="w-10 flex items-center h-full p-1">
			{#if type === 'parent'}
				<div class="bg-main w-0.5 h-full m-auto" />
			{/if}
		</div>
	</div>
	<div class="flex flex-col flex-1">
		<div class="flex items-end gap-1" use:click={profileClick}>
			{#if loaded}
				<p class="text-lg">{monu.username}</p>
				<p class="text-sm text-slate-700">@{monu.usertag}</p>
				<p class="text-sm text-slate-700">
					{date.date}
				</p>
			{:else}
				<p class="bg-slate-200 rounded h-5" style={`width: ${Math.random() * 5 + 5}%;`} />
				<p class="bg-slate-200 rounded h-4" style={`width: ${Math.random() * 5 + 5}%;`} />
				<p class="bg-slate-200 rounded h-4" style={`width: ${Math.random() * 5 + 5}%;`} />
			{/if}
		</div>
		<div class="flex flex-col flex-1 gap-2">
			{#if loaded}
				<div bind:this={contentParent} class="flex flex-col gap-1">
					<Parser {monu} />
					{#if monu.type === 1 && monu.parent}
						<QuoteMonu monu={monu.parent} />
					{/if}
				</div>
			{:else}
				{#each Array(Math.ceil(Math.random() * 5)) as _}
					<div class="bg-slate-200 rounded h-5" style={`width: ${Math.random() * 70 + 10}%;`} />
				{/each}
			{/if}
			<div class="flex align-middle items-center text-sm" bind:this={footer}>
				<button class="w-full flex">
					<div class="flex items-center m-auto gap-2" on:click={likeClick}>
						<svg
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-5 h-5 hover:fill-yellow-400 {monu.liked ? 'fill-yellow-400' : ''}"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
							/>
						</svg>
						<p>{monu.likedCount}</p>
					</div>
				</button>
				{#if comments}
					<div class="border-l-2 h-6" />
					<button class="w-full flex" on:click={childClick}>
						<svg
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-5 h-5 hover:fill-slate-600 m-auto"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
							/>
						</svg>
					</button>
				{/if}
				<div class="border-l-2 h-6" />
				<div class="w-full flex relative" bind:this={quoteDiv}>
					<button class="w-full flex" on:click={() => (quoteClicked = !quoteClicked)}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="m-auto w-5 h-5 hover:stroke-2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
							/>
						</svg>
					</button>
					{#if quoteClicked}
						<div
							class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full bg-slate-50 flex flex-col px-2 py-1 gap-1 items-start rounded-md z-10"
							transition:fade={{ duration: 100 }}
						>
							<button class="p-1" on:click={quoteClick}>인용하기</button>
							<button class="p-1" on:click={reMonuClick}>리모누</button>
						</div>
					{/if}
				</div>
				<div class="border-l-2 h-6" />
				<button class="w-full flex" on:click={shareClick}>
					<svg
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="m-auto w-5 h-5 hover:fill-slate-600"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>
<svelte:body on:click={onBodyClick} />
