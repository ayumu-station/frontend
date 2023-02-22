<script lang="ts">
	import { deserialize } from '$app/forms';
	import { createEventDispatcher } from 'svelte';
	import Skeleton from './SkeletonSuggestion.svelte';
	let isSuggestionLoading = false;
	export let list: Client.Hashtag[] = [];
	let controller: AbortController | undefined = undefined;

	export let selected = 0;

	const dispatch = createEventDispatcher();
	export let value = '';

	function suggestion(e: CustomEvent<string>) {
		if (controller) {
			controller.abort();
		}
		const v = e.detail;
		if (v === '') {
			isSuggestionLoading = false;
			list = [];
		} else {
			controller = new AbortController();
			isSuggestionLoading = true;
			const formData = new FormData();
			formData.append('q', v);
			fetch('/hashtag?/suggestion', {
				method: 'POST',
				body: formData,
				signal: controller.signal
			}).then((res) => {
				res.text().then((res) => {
					const result = deserialize(res);
					if (result.type === 'success' && result.data) {
						list = result.data.data;
						isSuggestionLoading = false;
					}
				});
			});
		}
	}

	function submit(e: CustomEvent<Client.Hashtag>) {
		dispatch('submit', e.detail);
		list = [];
		value = '';
	}
</script>

<Skeleton
	{list}
	{selected}
	{value}
	on:request:suggestion={suggestion}
	on:submit={submit}
	{isSuggestionLoading}
/>
