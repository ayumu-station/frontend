<script lang="ts">
	import { deserialize } from '$app/forms';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import { createEventDispatcher } from 'svelte';
	import followModal from '$lib/controller/modal/follow';
	import { click } from '$lib/use';
	import Image from './Image.svelte';
	import { getTimeString } from '$lib/util';
	import { toasts } from '$lib/store';
	export let user: Client.User;
	export let mini = false;
	const clientUser = getUser();
	let isSended = false;
	export let followedInFollowing: Client.SimpleUser[] = [];

	const dispatch = createEventDispatcher();

	function follow() {
		isSended = true;
		const data = new FormData();
		data.append('usertag', user.usertag);
		if (!user.followed) data.append('follow', '1');
		fetch('/u?/follow', {
			method: 'POST',
			body: data
		}).then((response) => {
			response.text().then((text) => {
				const res = deserialize(text);
				if (res.type === 'success' && res.data !== undefined && res.data.success === true) {
					const newFollowerCount = res.data.followerCount;
					user.followerCount = newFollowerCount;
					user.followed = !user.followed;
					user = user;
					dispatch('follow', res.data);
				} else {
					toasts.push({ type: 'error', message: res.error.message });
				}
				isSended = false;
			});
		});
	}
</script>

<div class={`flex left-2 -top-4 gap-2 rounded-xl p-5 ${mini ? '' : 'flex-col'}`}>
	<div class="flex items-end gap-3 w-full">
		<Image type={user.image} id={user.userid} size={mini ? 14 : 20} seed={user.userid} />
		<div class={`flex ${mini ? 'gap-3 items-center mt-auto mb-auto mr-auto' : 'flex-col'}`}>
			<p class="text-2xl">{user.username}</p>
			<p class={mini ? 'text-base' : 'text-xl'}>@{user.usertag}</p>
		</div>
		{#if $clientUser && $clientUser.usertag !== user.usertag}
			<button
				class="rounded-lg bg-white border border-slate-400 p-2 mt-auto mb-auto"
				use:click={follow}>{user.followed ? '언팔로우' : '팔로우'}</button
			>
		{/if}
	</div>
	{#if !mini}
		<div class="flex gap-2">
			<div
				class="flex items-center border-l border-main"
				use:click={() => {
					followModal.options.set({
						type: 'follower',
						user
					});
					followModal.enabled.set(true);
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-5 h-5 m-2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
					/>
				</svg>
				<div>
					<p>팔로워</p>
					<p class="text-slate-700">{user.followerCount}</p>
				</div>
			</div>
			<div
				class="flex items-center border-l border-main"
				use:click={() => {
					followModal.options.set({
						type: 'following',
						user
					});
					followModal.enabled.set(true);
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-5 h-5 m-2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
					/>
				</svg>
				<div>
					<p>팔로잉</p>
					<p class="text-slate-700">{user.followingCount}</p>
				</div>
			</div>
			<div class="flex items-center border-l border-main">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-5 h-5 m-2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
					/>
				</svg>
				<div class="flex flex-col">
					<p>가입일</p>
					<p>{getTimeString(user.created).date}</p>
				</div>
			</div>
		</div>
		{#if user.biography !== null}
			<p>{user.biography}</p>
		{/if}
		{#if followedInFollowing.length > 0}
			<div class="flex items-center">
				{#each followedInFollowing as followed, i}
					<Image type={followed.image} id={followed.userid} size={5} seed={followed.usertag} />
					<a class="font-medium" style="color: rgb(66, 135, 255);" href={`/u/${followed.usertag}`}
						>{followed.username}님{followedInFollowing.length - 1 > i ? ', ' : ''}</a
					>
				{/each}
				<p>{followedInFollowing.length === 5 ? '...' : ''}이 팔로우 중입니다.</p>
			</div>
		{/if}
	{/if}
</div>
