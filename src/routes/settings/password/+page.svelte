<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import { toasts } from '$lib/store';
	const onEnhance: SubmitFunction = ({ form, data, action, cancel }) => {
		return async ({ result, update }) => {
			switch (result.type) {
				case 'success':
					toasts.push({ type: 'success', message: '변경되었습니다.' });
					break;

				case 'failure':
					toasts.push({ type: 'error', message: '올바른 값을 입력해주세요.' });
					break;

				default:
					break;
			}
		};
	};
</script>

<div class="p-3 m-auto flex flex-col gap-5">
	<form method="POST" use:enhance={onEnhance} class="flex flex-col gap-1">
		<label for="password">비밀번호</label><br />
		<input type="password" name="password" id="password" required />
		<input type="submit" value="비밀번호 변경" />
	</form>
</div>

<style>
	input {
		@apply rounded-lg border-2 px-2 py-1 outline-none focus:ring;
	}

	input[type='submit'] {
		@apply hover:bg-slate-100;
	}
</style>
