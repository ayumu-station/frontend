<script type="ts">
	import { tweened } from 'svelte/motion';
	import { cubicIn, cubicOut } from 'svelte/easing';
	export let enable = false;
	let start = tweened(0, {
		duration: 400,
		easing: cubicIn
	});
	let end = tweened(0, {
		duration: 400,
		easing: cubicOut
	});

	function update(i: boolean) {
		if (i) {
			start.set(100);
			end.set(100).then(() => {
				start.set(0, { duration: 0 });
				end.set(0, { duration: 0 });
				if (enable) {
					update(enable);
				}
			});
		}
	}

	$: update(enable);
</script>

<div
	class="absolute overflow-hidden transition-wh left-0 top-1/2 -translate-y-1/2 w-full line h-2 pointer-events-none"
	style={`background: linear-gradient(0.25turn, transparent ${$start - 1}%, 
    rgb(0, 0, 0) ${$start}% ${$end - 1}%, 
    transparent ${$end}%);`}
/>
