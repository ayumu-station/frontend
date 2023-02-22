<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="m-auto w-full h-full flex items-center flex-col">
	<div class="bg-slate-200 p-4 flex flex-col">
		<img
			src="https://media.tenor.com/C3VHDV3StZ0AAAAC/bocchi-the-rock-hitori-gotou.gif"
			alt="status"
		/>
		<div class="border-b-2 mt-2 mb-2 h-2 w-full border-black" />
		<p class="font-semibold text-3xl">{$page.error?.message}</p>
	</div>
</div>
