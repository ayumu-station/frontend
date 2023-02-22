<script lang="ts">
	import { deserialize } from '$app/forms';
	import { createEventDispatcher } from 'svelte';
	import { toasts } from '$lib/store';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import Textarea from '../Lexical/Textarea.svelte';
	import Skeleton from './SkeletonBuild.svelte';
	export let type: 'default' | 'quote' = 'default';
	export let parentMonu: Client.Monu | undefined = undefined;
	const user = getUser();
	export let opened = false;
	export let height = 40;
	let isSended = false;

	const dispatch = createEventDispatcher();

	async function onSubmit(e: CustomEvent<FormData>) {
		isSended = true;
		const response = await fetch('/monu?/build', {
			method: 'POST',
			body: e.detail
		});
		const res = deserialize(await response.text());
		switch (res.type) {
			case 'success':
				toasts.push({ type: 'success', message: '성공' });
				dispatch('submit', res.data);
				break;

			case 'error':
				toasts.push({ type: 'error', message: res.error.message });
				break;

			default:
				break;
		}
		isSended = false;
	}
</script>

{#if $user}
	<Skeleton
		on:submit={onSubmit}
		user={$user}
		{opened}
		{parentMonu}
		{Textarea}
		{isSended}
		{type}
		{height}
	/>
{/if}
