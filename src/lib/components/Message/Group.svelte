<script lang="ts">
	import { getTimeString, randomGradient } from '$lib/util';
	import Rand from 'rand-seed';

	export let selected = false;
	export let group: Client.MessageGroup | undefined = undefined;
	export let pulse = true;

	$: time = group
		? getTimeString(group.updated ? group.updated : BigInt(group.created))
		: { date: '', time: '' };
	$: imageUrl = group
		? group.image === 1
			? `${import.meta.env.VITE_STORAGE_URL}/messageGroup/${group.id}.png?t=${new Date().getTime()}`
			: group.image
		: '';
</script>

<div
	class={`border-b flex items-center gap-2 p-2 ${selected ? 'bg-slate-200' : ''} ${
		group ? '' : pulse ? 'animate-pulse' : ''
	}`}
	on:click
>
	<div
		class="w-14 h-14 rounded-full bg-center bg-cover"
		style={`${
			group && (typeof group.image == 'string' || group.image > 0)
				? `background-image: url('${imageUrl}');`
				: `background:${randomGradient(new Rand(group ? group.id : ''))};`
		}`}
	/>
	<div class="flex flex-1 flex-col h-full overflow-hidden gap-2">
		<p
			class={`h-1/2 font-medium rounded-md ${group ? '' : 'bg-slate-300'}`}
			style={group ? '' : `width: ${Math.random() * 70 + 10}%;`}
		>
			{group ? (group.title ? group.title : '제목 없음') : ''}
		</p>
		<p
			class={`h-1/2 text-sm text-slate-700 truncate rounded-md ${group ? '' : 'bg-slate-300'}`}
			style={group ? '' : `width: ${Math.random() * 70 + 20}%;`}
		>
			{group ? (group.latestMessage ? group.latestMessage : '') : ''}
		</p>
	</div>
	<div class="flex flex-col items-end">
		<p class={`text-sm text-slate-700 ${group ? '' : 'bg-slate-300 w-7'}`}>
			{group ? time.date : ''}
		</p>
		<p class={`text-sm text-slate-700 ${group ? '' : 'bg-slate-300 w-7'}`}>
			{group ? time.time : ''}
		</p>
	</div>
</div>
