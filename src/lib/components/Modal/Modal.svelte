<script lang="ts">
	import { click } from '$lib/use';
	import { createEventDispatcher } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	export let target: HTMLElement | undefined = undefined;
	export let labelledby = '';
	export let describedby = '';

	const dispatch = createEventDispatcher();

	function backdropClick() {
		dispatch('backdropClick');
	}

	function anim(node: Element, { delay = 0, duration = 150 }) {
		if (target && node.parentElement) {
			const boundingClientRect = target.getBoundingClientRect();
			const left = (boundingClientRect.left / window.innerWidth) * 100;
			const top = (boundingClientRect.top / window.innerHeight) * 100;
			const width =
				(boundingClientRect.width / Number(getComputedStyle(node).width.replace('px', ''))) * 100;
			const height =
				(boundingClientRect.height / Number(getComputedStyle(node).height.replace('px', ''))) * 100;
			return {
				delay,
				duration,
				css: (t: number) => `
					left: ${left + (50 - left) * t}%;
					top: ${top + (50 - top) * t}%;
					transform: translate(${-50 * t}%, ${-50 * t}%);
					width: ${width + (100 - width) * t}%; 
					height: ${boundingClientRect.height}px;
					opacity: ${t};
					`,
				easing: cubicOut
			};
		} else {
			return {
				delay,
				duration,
				css: (t: number) => `
					opacity: ${t};
					`,
				easing: cubicOut
			};
		}
	}
</script>

<div
	class="fixed left-0 top-0 bg-gray-700 w-full h-full opacity-20 z-30"
	use:click={backdropClick}
	transition:fade={{ duration: target ? 150 : 0 }}
/>
<div
	class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 flex flex-col max-w-default w-full max-h-4/5 overflow-y-auto z-50 transition-all"
	on:scroll
	transition:anim={{}}
	role="dialog"
	aria-labelledby={labelledby}
	aria-describedby={describedby}
>
	<slot />
</div>
