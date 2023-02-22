<script lang="ts">
	import { enabled, monu, target } from '$lib/controller/modal/monu';
	import { deserialize } from '$app/forms';
	import { onMount } from 'svelte';
	import Monu from '$lib/components/Monu/Monu.svelte';
	import Build from '$lib/components/Monu/Build.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { click } from '$lib/use';
	import Modal from './Modal.svelte';
	import List from '../Monu/List.svelte';
	import Scrollbars from '../Scrollbars.svelte';

	let childs: Client.Monu[] = [];
	let isEnded = false;
	let isLoading = false;
	let loadCount = 10;

	$: {
		if ($monu.id !== '') {
			const formData = new FormData();
			formData.append('id', $monu.id);
			fetch('/monu?/getChilds', {
				method: 'POST',
				body: formData
			}).then((res) => {
				res.text().then((res) => {
					const result = deserialize(res);
					if (result.type === 'success' && result.data !== undefined) {
						const resChilds: Client.Monu[] = result.data.childs;
						childs = resChilds;
						loadCount = resChilds.length;
					}
				});
			});
		}
	}

	onMount(() => {
		return enabled.subscribe((enabled) => {
			if (enabled) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		});
	});

	const onSubmit = (e: CustomEvent<any>) => {
		const monu = e.detail.monu as Client.Monu;
		childs.splice(0, 0, monu);
		childs = childs;
	};

	// Monu Childs Pagination
	function onScroll(e: Event) {
		const target = e.target as HTMLDivElement;
		if (
			parent &&
			childs.length > 0 &&
			!isLoading &&
			!isEnded &&
			target.clientHeight + target.scrollTop >= target.scrollHeight - 5
		) {
			isLoading = true;
			loadCount += 10;
			const formData = new FormData();
			formData.append('id', $monu.id);
			formData.append('cursor', childs[childs.length - 1].id);
			fetch('/monu?/getChilds', {
				method: 'POST',
				body: formData
			}).then((res) => {
				res.text().then((res) => {
					const result = deserialize(res);
					if (result.type === 'success' && result.data !== undefined && parent) {
						const resChilds: Client.Monu[] = result.data.childs;
						childs = [...childs, ...resChilds];
						loadCount = childs.length;
						isLoading = false;
						if (resChilds.length < 10) isEnded = true;
					}
				});
			});
		}
	}
</script>

{#if $enabled}
	<Modal
		on:backdropClick={() => enabled.set(false)}
		on:scroll={onScroll}
		target={$target}
		labelledby="modalMonu"
		describedby="modalMonuList"
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
		<Scrollbars>
			{#if parent !== undefined}
				<div id="modalMonu">
					<Monu monu={$monu} loaded={true} comments={false} />
				</div>
				<Build parentMonu={$monu} on:submit={onSubmit} opened={true} />
				<div class="w-full brder-b-2 h-4" />
				<div id="modalMonuList">
					<List monus={childs} {loadCount} parent={$monu} />
				</div>
			{:else}
				<Monu />
			{/if}
		</Scrollbars>
	</Modal>
{/if}
