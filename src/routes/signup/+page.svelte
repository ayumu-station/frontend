<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import BuildCode from '$lib/components/BuildCode.svelte';
	import Text from '$lib/components/Input/Text.svelte';
	import type { PageData } from './$types';
	export let data: PageData;

	$: buildCode = $page.url.searchParams.get('bc');
	let inputBuildCode = '';

	function onBuildCodeSubmit(e: CustomEvent<string>) {
		goto(`?bc=${e.detail}`);
	}
</script>

<div class="flex h-full w-full justify-center items-center">
	<div class="m-auto w-96 rounded-lg p-5 flex flex-col gap-5">
		<p class="text-sm border-l-2 border-red-500 px-2">
			해당 사이트는 개발중인 사이트입니다. 빌드코드(가입코드)가 있어야 가입할 수 있습니다.<br />
			따라서, 개인정보와 같은 민감한 정보는 해당 사이트에 작성이 불가능합니다. <br />
			작성함으로 인하여 생기는 불이익은 책임지지 않습니다. <br />
			<span class="font-bold text-red-500"
				>오로지 테스트의 목적으로 사용해주시기 바랍니다.
			</span><br />
			또한, 언제든지 계정과 글과 같은 데이터들이 삭제될 수 있습니다. <br />
			해당 사이트는 기본적으로 사용자가 탈퇴할때까지 작성한 글, 프로필(사진, 이름, 태그, 자기소개 등),
			좋아요 내역, 채팅내역 등이 보관됩니다. <br />
			사용자 정보는 추천기능, 알림기능등을 위해 사용될 수 있습니다.<br />
			또한, 회원기능을 위하여 사이트에 로그인시 쿠키를 사용할 수 있습니다. <br />
			쿠키는 브라우저 설정을 통하여 비활성화 할 수 있지만, 회원기능이 작동하지 않을 수 있습니다.<br
			/>
			이미지들은 AWS(Amazon Web Services)에 저장되며, 글과 같은 정보들은 PlanetScale에 저장됩니다. 또한,
			실시간으로 처리되는 정보는 Cloudflare, Gigalixir를 통하여 처리됩니다.<br />
			이과정에서 국외이전이 일어날 수 있습니다.
			<br />
			기타 문의사항은
			<a href="https://github.com/moka-ayumu" class="text-blue-700 underline">Github</a>를 통하여
			문의주세요.
		</p>
		{#if buildCode}
			{#if data.codePassed}
				<p class="text-4xl font-black">가입</p>
				<form method="POST" use:enhance class="flex flex-col gap-2">
					<input type="hidden" name="buildcode" value={buildCode} />
					<Text title="이름" id="username" />
					<Text title="유저태그(아이디)" prefix="@" id="usertag" />
					<Text title="비밀번호" id="password" type="password" />
					<input type="submit" value="가입" />
				</form>
			{:else}
				<p>코드가 올바르지 않습니다.</p>
			{/if}
		{:else}
			<p class="text-xl font-bold">빌드코드(가입코드) 입력</p>
			<BuildCode on:submit={onBuildCodeSubmit} editable={true} />
		{/if}
	</div>
</div>

<style>
	input[type='text'],
	input[type='password'] {
		@apply border rounded-lg px-2 py-1 outline-none;
	}
</style>
