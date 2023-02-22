<script lang="ts">
	import { goto } from '$app/navigation';
	import Skeleton from './SkeletonTextarea.svelte';
	import suggestionMention from '../User/Suggestion.svelte';
	import suggestionHashtag from '../Hashtag/Suggestion.svelte';

	export let data = {
		text: '',
		mention: [] as string[],
		hashtag: [] as string[]
	};
	export let editable = true;
</script>

<Skeleton
	{data}
	{editable}
	{suggestionHashtag}
	{suggestionMention}
	on:click:hashtag={(e) => goto(`/search?p=%23${e.detail}`)}
	on:click:mention={(e) => goto(`/u/${e.detail}`)}
/>
