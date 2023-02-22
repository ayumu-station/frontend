<script lang="ts">
	import Textarea from '../Lexical/Textarea.svelte';
	import Image from '../User/Image.svelte';

	export let monu: Client.Monu;
</script>

<a class="flex flex-col border rounded-xl bg-slate-50 p-2 text-sm" href={`/monu/${monu.id}`}>
	<div class="flex gap-1 items-center">
		<Image size={6} id={monu.userid} seed={monu.userid} type={monu.image} />
		<p>{monu.username}</p>
		<p class="text-xs">@{monu.usertag}</p>
	</div>
	<Textarea
		editable={false}
		data={{
			hashtag: monu.hashtag,
			mention: monu.mention,
			text: monu.content
		}}
	/>
</a>
