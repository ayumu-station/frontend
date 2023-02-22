<script lang="ts">
	import { toasts } from '$lib/store';
	import { cubicOut } from 'svelte/easing';

	function anim(node: Element, { delay = 0, duration = 1000 }) {
		return {
			delay,
			duration,
			css: (t: number) => `
					width: ${Math.max(100 * (t - 0.2) * 1.25, 0)}%; 
					transform: scale(${Math.min(t * 5, 1)});
					`,
			easing: cubicOut
		};
	}
</script>

<div class="fixed left-1/2 top-3 -translate-x-1/2 w-56 flex flex-col gap-1 z-50">
	{#each $toasts as toast}
		<div
			class="border border-blue-200 bg-blue-50 flex rounded-full gap-2 items-center p-1 min-w-[2rem] max-w-xs m-auto w-full overflow-hidden"
			transition:anim={{}}
		>
			<div class="flex-shrink-0">
				{#if toast.type === 'success'}
					<svg
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
							d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				{:else}
					<svg
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
							d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
						/>
					</svg>
				{/if}
			</div>
			<p class="truncate">
				{toast.message}
			</p>
		</div>
	{/each}
</div>
