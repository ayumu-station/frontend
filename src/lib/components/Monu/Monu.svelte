<script lang="ts">
	import { deserialize } from '$app/forms';
	import { goto } from '$app/navigation';
	import Controller, { enabled, target } from '$lib/controller/modal/monu';
	import { toasts } from '$lib/store';
	import { createEventDispatcher, onMount } from 'svelte';
	import { tempMonu } from '$lib/util';
	import SkeletonMonu from './SkeletonMonu.svelte';
	import Parser from './Parser.svelte';
	export let monu: Client.Monu = tempMonu();
	export let pos: number | undefined = undefined;
	export let loaded = false;
	export let comments = true;
	export let parent: Client.Monu | undefined = undefined;

	const dispatch = createEventDispatcher();

	onMount(() => {
		Controller.monu.subscribe((modalMonu) => {
			if (modalMonu.id === monu.id) {
				monu = modalMonu;
			}
		});
	});

	function mainClick(e: CustomEvent<{ monu: Client.Monu; monuDiv: HTMLDivElement }>) {
		dispatch('click:main');
	}

	function profileClick(e: CustomEvent<{ monu: Client.Monu; monuDiv: HTMLDivElement }>) {
		if (loaded) {
			enabled.set(false);
			goto(`/u/${e.detail.monu.usertag}`);
		}
	}

	function likeClick(e: CustomEvent<{ monu: Client.Monu; monuDiv: HTMLDivElement }>) {
		if (loaded) {
			const formData = new FormData();
			formData.append('monuid', e.detail.monu.id);
			if (!e.detail.monu.liked) {
				formData.append('like', '1');
			}
			fetch('/monu?/like', {
				method: 'POST',
				body: formData
			}).then((res) => {
				res.text().then((res) => {
					const result = deserialize(res);
					if (result.type === 'success' && result.data !== undefined && result.data.success >= 0) {
						e.detail.monu.likedCount = result.data.success;
						e.detail.monu.liked = !e.detail.monu.liked;
						Controller.monu.set(monu);
						dispatch('update', { monu: e.detail.monu });
					}
				});
			});
		}
	}

	function childClick(e: CustomEvent<{ monu: Client.Monu; monuDiv: HTMLDivElement }>) {
		if (loaded) {
			target.set(e.detail.monuDiv);
			enabled.set(true);
			Controller.monu.set(e.detail.monu);
		}
	}

	function shareClick(e: CustomEvent<{ monu: Client.Monu; monuDiv: HTMLDivElement }>) {
		if (loaded) {
			navigator.clipboard
				.writeText(`${window.location.origin}/monu/${e.detail.monu.id}`)
				.then(() => {
					toasts.push({ type: 'success', message: '주소가 복사되었습니다.' });
				});
		}
	}

	function remonuClick(e: CustomEvent<{ monu: Client.Monu; monuDiv: HTMLDivElement }>) {
		if (loaded) {
			const formData = new FormData();
			formData.append('monuid', e.detail.monu.id);
			fetch('/monu?/remonu', {
				method: 'POST',
				body: formData
			}).then((res) => {
				res.text().then((res) => {
					const result = deserialize(res);
					if (result.type === 'success' && result.data !== undefined) {
						toasts.push({
							type: 'success',
							message: '리모누에 성공하였습니다.'
						});
					}
				});
			});
		}
	}

	function quoteClick(e: CustomEvent<{ monu: Client.Monu; monuDiv: HTMLDivElement }>) {
		if (loaded) {
			goto(`/monu?type=quote&id=${monu.id}`);
		}
	}
</script>

<SkeletonMonu
	{comments}
	{loaded}
	{monu}
	{pos}
	{Parser}
	{parent}
	on:click:child={childClick}
	on:click:like={likeClick}
	on:click:profile={profileClick}
	on:click:share={shareClick}
	on:click:main={mainClick}
	on:click:remonu={remonuClick}
	on:click:quote={quoteClick}
/>
