<script lang="ts">
	import UserComponent from '$lib/components/User/User.svelte';
	import { getUser } from '@lucia-auth/sveltekit/client';
	import { onMount } from 'svelte';
	import type { Readable } from 'svelte/store';
	import { biography, username, usertag } from './store';
	import type { User } from 'lucia-auth';
	const user = getUser() as Readable<User>;

	onMount(() => {
		biography.set($user.biography);
		username.set($user.username);
		usertag.set($user.usertag);
	});
</script>

<!-- <UserComponent
	user={{
		biography: $biography,
		created: $user.created,
		followed: false,
		followerCount: $user.followerCount,
		followingCount: $user.followingCount,
		image: $user.image,
		username: $username,
		usertag: $usertag,
		userid: $user.userid
	}}
/> -->
<slot />
