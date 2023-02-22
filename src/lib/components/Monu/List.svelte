<script lang="ts">
	import Monu from './Monu.svelte';
	import Skeleton from './SkeletonList.svelte';
	export let parent: Client.Monu | undefined = undefined;
	export let monus: (Client.Monu | Client.MonuNotification)[];
	export let loadCount: number;
</script>

<Skeleton {loadCount} {monus} {Monu} {parent} />
