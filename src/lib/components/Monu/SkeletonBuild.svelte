<script lang="ts">
	import { createEventDispatcher, onMount, SvelteComponentTyped, type ComponentType } from 'svelte';
	import LoadingBar from '$lib/components/LoadingBar.svelte';
	import { click } from '$lib/use';
	import Image from '$lib/components/User/Image.svelte';
	import SkeletonTextarea from '../Lexical/SkeletonTextarea.svelte';
	import type { ClientUser } from '@lucia-auth/sveltekit/client/user';
	export let type: 'default' | 'quote' = 'default';
	export let parentMonu: Client.Monu | undefined = undefined;
	export let user: ClientUser;
	export let opened = false;
	export let Textarea: ComponentType<
		SvelteComponentTyped<{
			data?: {
				text: string;
				mention: string[];
				hashtag: string[];
			};
			editable?: boolean;
		}>
	> = SkeletonTextarea;
	let isOpend = false;
	export let isSended = false;
	let mainDiv: HTMLDivElement;
	let dialog: HTMLDialogElement;
	let dialogInput: HTMLInputElement;
	let dialogType: 'image' | 'youtube' = 'image';
	export let data = {
		text: '',
		mention: [] as string[],
		hashtag: [] as string[]
	};
	let images: Blob[] = [];
	export let height = 40;

	const dispatch = createEventDispatcher();

	import type Jimp from 'jimp';
	let jimp: typeof Jimp;
	import BlobImage from '../BlobImage.svelte';
	import Scrollbars from '../Scrollbars.svelte';
	import { toasts } from '$lib/store';
	import QuoteMonu from './QuoteMonu.svelte';

	onMount(async () => {
		await import('jimp/browser/lib/jimp');
		jimp = (window as any).Jimp;
	});

	$: {
		if (opened) isOpend = true;
	}

	function open() {
		isOpend = true;
	}

	function handleSubmit(e: Event & { currentTarget: EventTarget & HTMLFormElement }) {
		isSended = true;
		const formData = new FormData();
		if (parentMonu) formData.append('parent', parentMonu.id);
		formData.append('type', type);
		formData.append('data', JSON.stringify(data));
		for (let i = 0; i < images.length; i++) {
			const image = images[i];
			formData.append('images', image);
		}
		images = [];
		data = {
			text: '',
			mention: [] as string[],
			hashtag: [] as string[]
		};
		dispatch('submit', formData);
	}

	function focusOut(e: FocusEvent) {
		// https://stackoverflow.com/a/47563344
		if (!opened && !mainDiv.contains(e.relatedTarget as Node | null)) {
			isOpend = false;
		}
	}

	function onClose(e: Event & { currentTarget: EventTarget & HTMLDialogElement }) {
		const value = dialogInput.value;
		dialogInput.value = '';
		if (dialog.returnValue === 'submit') {
		}
	}

	async function onFileChange(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (e.currentTarget.files) {
			if (images.length < 4) {
				const file = e.currentTarget.files[0];
				const arrayBuffer = await file.arrayBuffer();
				const image = await jimp.read(arrayBuffer as any);
				const scale = Math.min(2000 / image.getWidth(), 2000 / image.getHeight());
				if (scale < 1) image.scale(scale);
				const res = await image.getBufferAsync('image/png');
				images.push(new Blob([new Uint8Array(res)], { type: 'image/png' }));
				images = images;
			} else {
				toasts.push({ type: 'error', message: '파일 최대 개수를 초과하였습니다.' });
			}
		}
	}
</script>

{#if user}
	<div
		class="relative {isOpend ? '' : 'h-10'} min-h-[2.5rem] transition-wh w-full flex-shrink-0"
		on:focusout={focusOut}
		style={isOpend ? `height: ${0.25 * height}rem;` : ''}
		bind:this={mainDiv}
	>
		<button
			class="{isOpend
				? 'h-0'
				: 'h-full'} overflow-hidden transition-all absolute top-0 left-0 w-full outline-none"
			use:click={open}>+ 새로운 모누 쓰기</button
		>
		<form
			on:submit|preventDefault={handleSubmit}
			class="{isOpend
				? 'h-full border-b-2 opacity-100'
				: 'h-0 overflow-hidden opacity-0'} transition-all absolute top-0 left-1/2 -translate-x-1/2 border-t-2 flex w-full z-10"
		>
			<div class="flex w-full h-full px-2 py-1">
				<Image type={user.image} id={user.userid} size={12} seed={user.userid} />
				<div class="flex flex-col flex-1">
					<Scrollbars>
						<div>
							<svelte:component this={Textarea} bind:data editable={true} />
							{#if parentMonu}
								<QuoteMonu monu={parentMonu} />
							{/if}
						</div>
					</Scrollbars>
					<div class="flex h-7 gap-2 items-center">
						<label class="cursor-pointer">
							<input type="file" class="hidden" accept="image/*" on:change={onFileChange} />
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-6 h-6"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
								/>
							</svg>
						</label>
						{#each images as image}
							<button
								type="button"
								class="rounded-lg h-full overflow-hidden relative after:absolute after:w-full after:h-full after:left-0 after:top-0 after:bg-white after:bg-opacity-50 after:opacity-0 after:hover:opacity-100 after:content-['X'] after:font-black after:flex after:justify-center after:items-center"
								on:click={() => (images = images.filter((i) => i !== image))}
							>
								<BlobImage blob={image} />
							</button>
						{/each}
					</div>
				</div>
			</div>
			<button type="submit">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-5 h-5"
				>
					<path
						d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z"
					/>
				</svg>
			</button>
			<LoadingBar enable={isSended} />
		</form>
	</div>
	<dialog bind:this={dialog} on:close={onClose} class="rounded-xl">
		<form method="dialog" class="flex flex-col gap-3">
			<input
				type="text"
				bind:this={dialogInput}
				placeholder={dialogType === 'image' ? '이미지 링크 주소' : '유튜브 영상 ID'}
			/>
			<div class="flex m-auto gap-3">
				<button type="submit" value="submit">확인</button>
				<button type="submit" value="cancel">취소</button>
			</div>
		</form>
	</dialog>
{/if}
