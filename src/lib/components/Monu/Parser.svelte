<script lang="ts">
	export let monu: Client.Monu;
	import Textarea from '../Lexical/Textarea.svelte';
	import Skeleton from './SkeletonParser.svelte';
</script>

<Skeleton {monu} {Textarea} />
