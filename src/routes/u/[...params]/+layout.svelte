<script lang="ts">
	import User from '$lib/components/User/User.svelte';
	import type { LayoutData } from './$types';
	export let data: LayoutData;
</script>

<svelte:head>
	<title>STATION{data.user !== null ? ` : ${data.user.username}` : ''}</title>
</svelte:head>
{#if data.user !== null}
	<div>
		<User user={data.user} followedInFollowing={data.followedInFollowing} />
		<div class="menu">
			<a href={`/u/${data.user.usertag}`} data-checked={data.type === 'home'}>모누</a>
			<a href={`/u/${data.user.usertag}/with_replies`} data-checked={data.type === 'with_replies'}
				>모누 & 답글</a
			>
			<a href={`/u/${data.user.usertag}/media`} data-checked={data.type === 'media'}>미디어</a>
			<a href={`/u/${data.user.usertag}/likes`} data-checked={data.type === 'likes'}>좋아요</a>
		</div>
		<slot />
	</div>
{:else}
	<h1>Invalid User</h1>
{/if}

<style lang="scss">
	.menu {
		@apply flex border-b;
		a {
			@apply w-full text-center p-3 text-lg relative;

			&[data-checked='true'] {
				@apply font-semibold;
				&:after {
					content: '';
					background: rgb(72, 223, 165);
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					height: 2px;
					width: 50%;
				}
			}
		}
	}
</style>
