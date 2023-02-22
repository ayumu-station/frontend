<script lang="ts">
	import { randomGradient } from '$lib/util';
	import Rand from 'rand-seed';
	export let seed: string;
	export let type: number;
	export let id: string;
	export let size = 10;

	$: imageUrl =
		type === 1
			? `${import.meta.env.VITE_STORAGE_URL}/u/${id}.png?t=${Math.round(
					new Date().getTime() / 10000
			  )}`
			: '';
</script>

<div
	style={`width: ${0.25 * size}rem;height: ${0.25 * size}rem; ${
		type === 1
			? `background-image: url(${imageUrl});`
			: `background:${randomGradient(new Rand(seed))};`
	}`}
	class="bg-center bg-cover rounded-full flex-shrink-0"
/>
