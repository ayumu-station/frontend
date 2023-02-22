<script lang="ts">
	import MediaMonu from './Media.svelte';
	export let monus: Client.Monu[];
</script>

<div class="flex flex-wrap">
	{#each monus as monu, i}
		<div class="relative w-1/3">
			<!-- <Monu {monu} pos={i} /> -->
			<MediaMonu {monu} pos={i} />
		</div>
	{/each}
</div>
