<script lang="ts">
	import Build from '$lib/components/Monu/Build.svelte';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	export let data: PageData;

	const user = getUser();
	function onSubmit(e: CustomEvent<{ monu: Client.Monu }>) {
		//
	}

	$: type = $page.url.searchParams.get('type');
</script>

<div>
	{#if $user}
		<Build
			height={52}
			opened={true}
			on:submit={onSubmit}
			parentMonu={data.monu}
			type={type === 'default' || type === 'quote' ? type : 'default'}
		/>
	{/if}
</div>
