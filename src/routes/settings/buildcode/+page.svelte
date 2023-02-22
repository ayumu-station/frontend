<script lang="ts">
	import { enhance } from '$app/forms';
	import BuildCode from '$lib/components/BuildCode.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div>
	{#if data.canCreate}
		<p>보유중인 빌드코드</p>
		{#each data.buildCodes as buildCode}
			<BuildCode value={buildCode.id} />
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="buildcode" value={buildCode.id} />
				<button>삭제</button>
			</form>
		{/each}
		<form method="POST" action="?/create" use:enhance>
			<button type="submit">생성</button>
		</form>
	{:else}
		<p>해당 기능을 사용할 권한이 없습니다.</p>
	{/if}
</div>
