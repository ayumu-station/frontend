<script lang="ts">
	import { afterUpdate } from 'svelte';

	export let blob: Blob;
	let image: HTMLImageElement;

	afterUpdate(() => {
		const reader = new FileReader();
		reader.onload = () => {
			if (reader.result) image.src = reader.result.toString();
		};
		reader.readAsDataURL(blob);
	});
</script>

<img bind:this={image} class="object-contain h-full" />
