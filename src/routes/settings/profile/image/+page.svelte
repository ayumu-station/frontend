<script lang="ts">
	import { deserialize, enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import { toasts } from '$lib/store';
	import User from '$lib/components/User/User.svelte';
	import ImageEditor from '$lib/components/ImageEditor.svelte';
	import type { ActionResult } from '@sveltejs/kit';
	import { goto } from '$app/navigation';

	let inputFiles: FileList;
	let profileBase64: string = '';

	$: {
		if (inputFiles && inputFiles.length > 0) {
			const file = inputFiles.item(0) as File;
			const reader = new FileReader();
			reader.onload = () => {
				if (reader.result) {
					profileBase64 = reader.result as string;
				}
			};
			reader.onerror = () => {
				toasts.push({ type: 'error', message: '파일을 읽을 수 없습니다.' });
			};
			reader.readAsDataURL(file);
		}
	}

	async function onSubmit(e: CustomEvent<Blob>) {
		submit(e.detail);
	}

	async function submit(e: Blob | undefined = undefined) {
		const data = new FormData();
		if (e) data.append('image', e);

		const res = await fetch('/settings/profile/image', {
			method: 'POST',
			body: data
		});

		const result: ActionResult = deserialize(await res.text());
		switch (result.type) {
			case 'success':
				toasts.push({ type: 'success', message: '변경되었습니다.' });
				goto('/settings/profile/', { invalidateAll: true });
				break;

			case 'failure':
				toasts.push({ type: 'error', message: '오류가 발생했습니다.' });
				break;

			default:
				break;
		}
	}
</script>

<div class="p-3 m-auto flex flex-col gap-5">
	<input type="file" bind:files={inputFiles} />
	<button on:click={() => submit()}>프로필 사진 삭제</button>
	{#if profileBase64 !== ''}
		<ImageEditor img={profileBase64} on:submit={onSubmit} />
	{/if}
</div>

<style>
	input {
		@apply rounded-lg border-2 px-2 py-1 outline-none focus:ring;
	}

	input[type='submit'] {
		@apply hover:bg-slate-100;
	}
</style>
