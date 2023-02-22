<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	$: path = $page.url.pathname.split('/')[2];
</script>

<div class="flex flex-col gap-2 p-2">
	<p class="text-xl font-semibold">알림</p>
	<div class="menu">
		<a href={`/notifications`} data-checked={path === undefined}>전체</a>
		<a href={`/notifications/mentions`} data-checked={path === 'mentions'}>멘션</a>
	</div>
	<section class="flex flex-col" role="feed">
		<slot />
	</section>
</div>

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
