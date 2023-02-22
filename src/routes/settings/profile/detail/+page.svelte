<script lang="ts">
	import { deserialize, enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import { toasts } from '$lib/store';
	import ImageEditor from '$lib/components/ImageEditor.svelte';
	import type { ActionResult } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import type { User } from 'lucia-auth';
	import type { Readable } from 'svelte/store';

	const user = getUser() as Readable<User>;
	let tagnotunique = false;

	const onEnhance: SubmitFunction = ({ form, data, action, cancel }) => {
		return async ({ result, update }) => {
			switch (result.type) {
				case 'success':
					tagnotunique = false;
					toasts.push({ type: 'success', message: '변경되었습니다.' });
					break;

				case 'failure':
					if ((result.data as Record<string, any>).type === 'tagnotunique') {
						tagnotunique = true;
					} else {
						toasts.push({ type: 'error', message: '올바른 값을 입력해주세요.' });
					}
					break;

				default:
					break;
			}
		};
	};
</script>

<form method="POST" use:enhance={onEnhance} class="flex flex-col gap-1">
	<label for="usertag">유저태그(아이디)</label>
	<input type="text" name="usertag" id="usertag" value={$user.usertag} required />
	{#if tagnotunique}
		<p class="text-red-400">이미 존재하는 태그입니다.</p>
	{/if}
	<label for="username">이름</label>
	<input type="text" name="username" id="username" value={$user.username} required />
	<label for="biography">자기소개</label>
	<input type="text" name="biography" id="biography" value={$user.biography} />
	<input type="submit" value="프로필 변경" />
</form>

<style>
	input {
		@apply rounded-lg border-2 px-2 py-1 outline-none focus:ring;
	}

	input[type='submit'] {
		@apply hover:bg-slate-100;
	}
</style>
