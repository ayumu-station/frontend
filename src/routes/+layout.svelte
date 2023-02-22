<script lang="ts">
	import '../app.css';
	import 'overlayscrollbars/overlayscrollbars.css';
	import { page } from '$app/stores';
	import { handleSession } from '@lucia-auth/sveltekit/client';
	import { getUser } from '@lucia-auth/sveltekit/client';

	handleSession(page);

	import { onMount } from 'svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import ModalMonu from '$lib/components/Modal/Monu.svelte';
	import ModalFollow from '$lib/components/Modal/Follow.svelte';
	import Toasts from '$lib/components/Toasts.svelte';
	import Image from '$lib/components/User/Image.svelte';
	import { click } from '$lib/use';
	import { prevUserTag, toasts, ws, wsConnected } from '$lib/store';
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
	import { onScroll, onUpdate } from '$lib/controller/ScrollBar';
	import { enhance } from '$app/forms';
	let searchBarX = 0;
	let searchBarWidth = 0;
	let windowInnerWidth = 0;
	$: overflowSearchBar = searchBarX + searchBarWidth > windowInnerWidth - 300;

	const user = getUser();

	onMount(() => {
		return user.subscribe((u) => {
			if ($prevUserTag !== u?.usertag) {
				prevUserTag.set(u?.usertag);
				if (u) {
					const socket = new WebSocket(`wss://${import.meta.env.VITE_WEBSOCKET_URL}/ws`);
					socket.onclose = () => {
						ws.set(undefined);
					};
					socket.addEventListener('message', (e) => {
						const res = JSON.parse(e.data);
						switch (res.type) {
							case 'message':
								const msg = res.msg as Client.Message;
								if (msg.usertag !== u.usertag) {
									toasts.push({
										type: 'success',
										message: msg.content
									});
								}
								break;
							case 'event':
								const data = res.data as { type: string; byUser: Client.SimpleUser };
								switch (data.type) {
									case 'likeMonu':
										toasts.push({
											type: 'success',
											message: `${data.byUser.username}님이 좋아요를 눌렀습니다.`
										});
										break;

									default:
										break;
								}

								break;
						}
					});
					socket.onopen = () => {
						wsConnected.set(true);
					};
					ws.set(socket);
				}
			}
			setInterval(() => {
				if ($ws) $ws.send(JSON.stringify({ type: 'ping' }));
			}, 55000);
		});
	});

	$: calNavClass = (path: string) =>
		`w-8 h-8 ${
			$page.url.pathname.split('/')[1] === path ||
			(path !== '' && $page.url.pathname.startsWith(path))
				? ''
				: 'stroke-slate-400'
		}`;
</script>

<svelte:head>
	<title>STATION</title>
</svelte:head>
<OverlayScrollbarsComponent
	options={{ scrollbars: { autoHide: 'scroll' } }}
	on:osScroll={onScroll}
	on:osUpdated={onUpdate}
>
	<div class="flex flex-col h-screen outline-none">
		<header
			class="flex py-3 px-6 items-center mb-3 gap-4 fixed w-full bg-white z-50 backdrop-blur-md bg-opacity-50"
		>
			<a class="font-black text-3xl" href="/">STATION</a>
			{#if !overflowSearchBar}
				<SearchBar bind:x={searchBarX} bind:width={searchBarWidth} />
			{/if}
			<div class="w-full bg-black h-0.5" />
			<div
				class="ml-auto flex-shrink-0 p-2 rounded-md relative group flex items-center gap-2 break-keep"
			>
				{#if $user === null}
					<a class="m-auto font-medium" href="/login">로그인</a>
				{:else}
					<Image type={$user.image} id={$user.userid} size={10} seed={$user.usertag} />
					<p>{$user?.username}</p>
					<div
						class="absolute z-50 w-full h-0 left-0 top-full overflow-hidden bg-white group-hover:h-32 group-hover:border-2 flex flex-col items-center justify-center divide-y-2 divide-solid divide-slate-50 transition-all rounded-b-2xl"
					>
						<a class="p-2" href="/settings">설정</a>
						<form action="/logout" method="POST" use:enhance>
							<button class="p-2 cursor-pointer"> 로그아웃 </button>
						</form>
					</div>
				{/if}
			</div>
		</header>
		<!-- {#if overflowSearchBar}
			<div class="pl-3 pr-3">
				<SearchBar bind:x={searchBarX} bind:width={searchBarWidth} />
			</div>
		{/if} -->
		<div class="flex w-full h-full max-w-default m-auto pt-20">
			<nav>
				<ol>
					<li>
						<a href="/">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class={calNavClass('')}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
								/>
							</svg>
						</a>
					</li>
					<li>
						<a href="/notifications">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class={calNavClass('notifications')}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
								/>
							</svg>
						</a>
					</li>
					<li>
						<a href="/messages">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class={calNavClass('messages')}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
								/>
							</svg>
						</a>
					</li>
					{#if $user}
						<li>
							<a href={`/u/${$user.usertag}`}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class={calNavClass(`/u/${$user.usertag}`)}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
									/>
								</svg>
							</a>
						</li>
					{/if}
					<li>
						<a href="/settings">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class={calNavClass('settings')}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						</a>
					</li>
				</ol>
			</nav>
			<div class="ml-12 flex-1 relative h-full">
				<slot />
				<a href="/license">
					<p class="text-right text-xs m-1">오픈소스 라이센스</p>
				</a>
			</div>
		</div>
	</div>
</OverlayScrollbarsComponent>

<Toasts />
<ModalMonu />
<ModalFollow />
<svelte:window bind:innerWidth={windowInnerWidth} />

<style lang="scss">
	nav {
		@apply flex flex-col fixed border-r h-full;
		& > ol > li {
			@apply p-2;
		}
	}
</style>
