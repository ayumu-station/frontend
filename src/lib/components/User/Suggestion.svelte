<script lang="ts">
	import { deserialize } from '$app/forms';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import { createEventDispatcher } from 'svelte';
	import Skeleton from './SkeletonSuggestion.svelte';
	let isSuggestionLoading = false;
	export let list: Client.SimpleUser[] = [];
	let controller: AbortController | undefined = undefined;

	export let selected = 0;

	const user = getUser();
	const dispatch = createEventDispatcher();
	export let value = '';
	export let input = false;
	export let excludeUsertag: string[] = $user ? [$user.usertag] : [];

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
			fetch('/u?/suggestion', {
				method: 'POST',
				body: formData,
				signal: controller.signal
			}).then((res) => {
				res.text().then((res) => {
					const result = deserialize(res);
					if (result.type === 'success' && result.data) {
						list = result.data.data.filter(
							(u: Client.SimpleUser) => !excludeUsertag.includes(u.usertag)
						);
						isSuggestionLoading = false;
					}
				});
			});
		}
	}

	function onSubmit(e: CustomEvent<Client.SimpleUser>) {
		list = [];
		value = '';
		dispatch('submit', e.detail);
	}
</script>

<Skeleton
	{isSuggestionLoading}
	{list}
	{selected}
	bind:value
	{input}
	on:request:suggestion={suggestion}
	on:submit={onSubmit}
/>
