<script lang="ts">
	import Image from '$lib/components/User/Image.svelte';
	import { getTimeString } from '$lib/util';

	export let message: Client.Message;
	$: time = getTimeString(message.created);
</script>

<div class="p-2 flex gap-2 items-center">
	{#if message.type === 0}
		<Image type={message.image} id={message.userid} size={12} seed={message.usertag} />
		<div class="flex flex-col">
			<p>
				{message.username} <span class="text-sm">@{message.usertag}</span>
				<span class="text-xs text-slate-500">{time.date} {time.time}</span>
			</p>
			<p>{message.content}</p>
		</div>
	{:else}
		<Image type={message.image} id={message.userid} size={6} seed={message.usertag} />
		<p class="text-slate-400">
			{message.username}님이 {message.type === 1 ? '초대되었습니다.' : '나갔습니다.'}
		</p>
	{/if}
</div>
