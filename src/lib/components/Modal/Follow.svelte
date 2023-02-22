<script lang="ts">
	import { deserialize } from '$app/forms';
	import { click } from '$lib/use';
	import { onDestroy, onMount } from 'svelte';
	import { enabled, options } from '$lib/controller/modal/follow';
	import Loading from '$lib/components/Loading.svelte';
	import User from '../User/User.svelte';
	import Modal from './Modal.svelte';

	let isLoading = false;
	let followList: Client.User[] = [];
	let isEnded = false;
	let events: (() => void)[] = [];

	onMount(() => {
		events.push(
			options.subscribe(() => {
				followList = [];
				getFollow();
			})
		);
		events.push(
			enabled.subscribe((enabled) => {
				if (enabled) {
					document.body.style.overflow = 'hidden';
				} else {
					document.body.style.overflow = '';
				}
			})
		);
	});

	onDestroy(() => {
		for (let i = 0; i < events.length; i++) {
			events[i]();
		}
	});

	function getFollow() {
		if ($options.user) {
			isLoading = true;
			const formData = new FormData();
			formData.append('usertag', $options.user.usertag);
			formData.append('type', $options.type);
			if (followList.length > 0) formData.append('c', followList[followList.length - 1].usertag);
			fetch('/u?/getFollow', {
				method: 'POST',
				body: formData
			}).then((res) => {
				res.text().then((res) => {
					const result = deserialize(res);
					if (result.type === 'success' && result.data) {
						const follow: Client.User[] = result.data.data;
						if (follow) {
							followList = [...followList, ...follow];
							if (follow.length < 10) isEnded = true;
						} else isEnded = true;
						isLoading = false;
					}
				});
			});
		}
	}

	// Pagination
	function onScroll(e: Event) {
		const target = e.target as HTMLDivElement;
		if (
			!isLoading &&
			!isEnded &&
			target.clientHeight + target.scrollTop >= target.scrollHeight - 5
		) {
			getFollow();
		}
	}
</script>

{#if $enabled}
	<Modal
		on:scroll={onScroll}
		on:backdropClick={() => enabled.set(false)}
		labelledby="followListTitle"
		describedby="followList"
	>
		<button class="absolute right-2 top-2" use:click={() => enabled.set(false)}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>

		<h1 class="font-light text-2xl" id="followListTitle">
			{$options.type === 'follower' ? '팔로워' : '팔로잉'}
		</h1>
		{#each followList as fuser}
			<div id="followList">
				<User user={fuser} mini={true} />
			</div>
		{/each}
		{#if isLoading}
			<div>
				<Loading />
			</div>
		{:else if !isEnded}
			<div>
				<button on:click={getFollow} class="w-full text-center">더 보기</button>
			</div>
		{/if}
	</Modal>
{/if}
