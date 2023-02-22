<script lang="ts">
	import { scrollEnded, overflowed } from '$lib/controller/ScrollBar';
	import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte';
	import * as devalue from 'devalue';
	import { deserialize } from '$app/forms';

	export let isLoading = false;
	export let isEnded = false;

	const dispatch = createEventDispatcher();
	const events: (() => void)[] = [];

	onMount(() => {
		events.push(
			scrollEnded.subscribe((ended) => {
				if (ended) {
					dispatch('ended');
					getData();
				}
			})
		);
		events.push(
			overflowed.subscribe((overflowed) => {
				if (!overflowed) manualLoad = true;
			})
		);
	});

	export let url = '';
	export let type: 'devalue' | 'deserialize' = 'deserialize';
	export let data: { [id: string]: null | string } = {};
	export let targetKey: string;
	export let loadCount = 10;
	export let manualLoad = false;

	$: {
		if (manualLoad) {
			getData();
			manualLoad = false;
		}
	}

	async function getData() {
		if ((type !== 'deserialize' || url !== '') && !isLoading && !isEnded) {
			isLoading = true;
			loadCount += 10;

			const entriesData = Object.entries(data);
			let res: Response;
			if (type === 'devalue') {
				// SvelteKit use 'devalue' for JSON transfer
				// https://github.com/sveltejs/kit/blob/e7bc0be2b25aff5ac151e3d83b771ad80cac1ab8/packages/kit/src/runtime/app/forms.js#L19
				const searchParams = new URLSearchParams(window.location.search);
				for (let i = 0; i < entriesData.length; i++) {
					const d = entriesData[i];
					if (d[1]) searchParams.append(d[0], d[1]);
				}
				res = await fetch(
					new URL(
						(window.location.pathname === '/' ? '' : window.location.pathname) +
							'/__data.json?' +
							searchParams.toString(),
						window.location.href
					)
				);
			} else {
				const formData = new FormData();
				for (let i = 0; i < entriesData.length; i++) {
					const d = entriesData[i];
					if (d[1]) formData.append(d[0], d[1]);
				}
				res = await fetch(url, { method: 'POST', body: formData });
			}

			const resText = await res.text();
			let responseJSON: { [id: string]: any } = {};

			if (type === 'devalue') {
				const json = JSON.parse(resText);
				if (json.type === 'data') {
					const nodes = json.nodes;
					for (let i = 0; i < nodes.length; i++) {
						const node = nodes[i];
						if (node && node.type === 'data') {
							responseJSON = { ...responseJSON, ...devalue.parse(JSON.stringify(node.data)) };
						}
					}
				} else new Error('Invalid Data');
			} else {
				const deserializeText = deserialize(resText);
				if (deserializeText.type === 'success' && deserializeText.data !== undefined) {
					responseJSON = deserializeText.data;
				} else new Error('Invalid Data');
			}

			isLoading = false;
			loadCount += responseJSON[targetKey].length - 10;
			if (responseJSON[targetKey].length < 10) isEnded = true;

			dispatch('data', responseJSON);
			tick().then(() => {
				if (!$overflowed) getData();
			});
		}
	}

	onDestroy(() => {
		for (let i = 0; i < events.length; i++) {
			events[i]();
		}
	});
</script>
