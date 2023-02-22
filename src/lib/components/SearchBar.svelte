<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';

	let searchParams: URLSearchParams = new URLSearchParams();
	let p = '';
	export let x = 0;
	export let width = 0;
	let form: HTMLFormElement;

	onMount(() => {
		const bounding = form.getBoundingClientRect();
		x = bounding.x;
		width = bounding.width;
	});

	afterNavigate(() => {
		searchParams = new URLSearchParams(window.location.search);
		const tmp = searchParams.get('p');
		p = tmp ? tmp : '';
	});
</script>

<form
	action="/search"
	class="m-auto border p-3 rounded-xl flex gap-2 relative max-w-xl w-full"
	bind:this={form}
	role="search"
>
	<input
		type="search"
		role="searchbox"
		name="p"
		id="p"
		class="m-auto outline-none w-full bg-transparent"
		value={p}
		placeholder="검색"
	/>
	<button type="submit" class="absolute right-2"
		><svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-6 h-6"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
			/>
		</svg>
	</button>
</form>
