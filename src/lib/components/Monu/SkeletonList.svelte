<script lang="ts">
	import type { ComponentType, SvelteComponentTyped } from 'svelte';
	import SkeletonMonu from './SkeletonMonu.svelte';
	export let monus: (Client.Monu | Client.MonuNotification)[];
	export let loadCount: number;
	export let parent: Client.Monu | undefined = undefined;
	export let Monu: ComponentType<
		SvelteComponentTyped<{
			monu?: Client.Monu;
			pos?: number | undefined;
			loaded?: boolean;
			comments?: boolean;
			parent?: Client.Monu;
		}>
	> = SkeletonMonu;
</script>

<section role="feed">
	<!-- {#each monus as monu, i}
		<div class="relative border-b">
			{#if monu.hasOwnProperty('type')}
				<p class="absolute right-0 top-1 z-10 px-2 py-1 text-xs">
					{#if monu.type === 'highLiked'}
						많은 사람들이 좋아해서 추천
					{:else}
						{monu.base?.username}님{monu.baseType === 'follow' ? '을 팔로우' : '이 좋아'}해서 추천
					{/if}
				</p>
			{/if}
			<Monu {monu} pos={i} loaded={loaded[Math.floor(i / countPerPage)]} />
		</div>
	{/each} -->
	{#each Array(loadCount) as _, i}
		<!-- <li class="relative border-b"> -->
		{#if i < monus.length}
			<svelte:component this={Monu} monu={monus[i]} pos={i} loaded={true} {parent} />
		{:else}
			<svelte:component this={Monu} />
		{/if}
		<!-- </li> -->
		<hr />
	{/each}
</section>
