<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Text from '$lib/components/Input/Text.svelte';
	let failed = false;
</script>

<div class="flex h-full w-full justify-center items-center">
	<div class="m-auto w-96 rounded-lg p-5 flex flex-col gap-5">
		<p class="text-4xl font-black">로그인</p>
		<form
			method="POST"
			use:enhance={({ form, data, action, cancel }) => {
				return async ({ result }) => {
					switch (result.type) {
						case 'success':
							invalidateAll();
							break;

						case 'failure':
							failed = true;
							break;

						case 'error':
							applyAction(result);
							break;

						default:
							break;
					}
				};
			}}
			class="flex flex-col gap-2"
		>
			<Text id="usertag" title="유저태그" />
			<Text id="password" title="비밀번호" type="password" />
			{#if failed}
				<p class="py-0.5 px-1 border-l-2 text-sm border-red-400">
					유저태그 또는 비밀번호가 올바르지 않습니다.
				</p>
			{/if}
			<div class="flex m-auto gap-3">
				<input type="submit" value="로그인" class="cursor-pointer" />
				<a href="/signup" class="cursor-pointer">가입</a>
			</div>
		</form>
	</div>
</div>

<style>
	input[type='text'],
	input[type='password'] {
		@apply border rounded-lg px-2 py-1 outline-none;
	}

	.failed {
		@apply border-red-400;
	}
</style>
