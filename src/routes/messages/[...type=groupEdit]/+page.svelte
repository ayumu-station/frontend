<script lang="ts">
	import Group from '$lib/components/Message/Group.svelte';
	import Image from '$lib/components/User/Image.svelte';
	import UserSuggestion from '$lib/components/User/Suggestion.svelte';
	import { messageGroups, toasts } from '$lib/store';
	import { fileToPng, toPng } from '$lib/util';
	import { Message } from '$lib/websocket';
	import { page } from '$app/stores';
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';

	let inviteUsers: Client.SimpleUser[] = [];
	let imageFiles: FileList | undefined;
	let inputTitle = '';
	let previewGroup: Client.MessageGroup = {
		created: BigInt(new Date().getTime()),
		id: '',
		image: 0,
		latestMessage: null,
		title: '',
		updated: BigInt(new Date().getTime())
	};

	$: isEdit = $page.params.type.split('/').length > 1;

	function getGroup() {
		const split = $page.params.type.split('/');
		if (split[0] === 'edit') {
			const findGroup = $messageGroups.find((group: Client.MessageGroup) => group.id == split[1]);
			if (findGroup) {
				previewGroup = { ...findGroup };
				inputTitle = previewGroup.title;
			} else {
				goto('/messages');
			}
		}
	}

	beforeNavigate(() => {
		inviteUsers = [];
		inputTitle = '';
		imageFiles = undefined;
		previewGroup = {
			created: BigInt(new Date().getTime()),
			id: '',
			image: 0,
			latestMessage: null,
			title: '',
			updated: BigInt(new Date().getTime())
		};
	});

	afterNavigate(() => {
		getGroup();
	});

	$: {
		if (imageFiles && imageFiles.length > 0) {
			const file = imageFiles.item(0) as File;
			if (file.size > 1000000) {
				toasts.push({
					type: 'error',
					message: '파일 용량이 초과햇습니다.'
				});
			} else {
				const reader = new FileReader();
				reader.onload = () => {
					if (reader.result) {
						previewGroup.image = reader.result as string;
					}
				};
				reader.onerror = () => {};
				reader.readAsDataURL(file);
			}
		} else {
			previewGroup.image = 0;
		}
	}

	$: {
		previewGroup.title = inputTitle;
	}

	function inviteSubmit(e: CustomEvent<Client.SimpleUser>) {
		const user = e.detail;
		if (inviteUsers.findIndex((inviteUser) => inviteUser.usertag === user.usertag) === -1) {
			inviteUsers = [user, ...inviteUsers];
		}
	}

	function createGroup() {
		if (inputTitle !== '') {
			if (imageFiles && imageFiles.length > 0) {
				const file = imageFiles.item(0) as File;
				fileToPng(file)
					.then((base64) => {
						const image = base64.replace('data:image/png;base64,', '');
						if (isEdit) {
							Message.modifyGroup(previewGroup.id, inputTitle, image).then((data) =>
								goto(`/messages/${data.groupId}`)
							);
						} else {
							Message.createGroup(
								inputTitle,
								image,
								inviteUsers.map((i) => i.usertag)
							).then((createdGroup) => goto(`/messages/${createdGroup.id}`));
						}
					})
					.catch(() => {
						toasts.push({
							type: 'error',
							message: '파일이 올바르지 않습니다.'
						});
					});
			} else {
				if (isEdit) {
					Message.modifyGroup(
						previewGroup.id,
						inputTitle,
						previewGroup.image === 0 ? '' : null
					).then((data) => goto(`/messages/${data.groupId}`));
				} else {
					Message.createGroup(
						inputTitle,
						'',
						inviteUsers.map((i) => i.usertag)
					).then((createdGroup) => goto(`/messages/${createdGroup.id}`));
				}
			}
		} else {
			toasts.push({
				type: 'error',
				message: '제목을 입력해주세요.'
			});
		}
	}
</script>

<div class="flex h-full">
	<div class="mx-auto mt-10 flex flex-col gap-2 overflow-y-scroll">
		<a href="/messages">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
				/>
			</svg>
		</a>
		<div class="preview">
			<Group pulse={false} />
			<Group group={previewGroup} />
			<Group pulse={false} />
		</div>
		<p class="font-medium text-2xl">{$page.params.type == 'new' ? '새 그룹' : '그룹 수정'}</p>
		<form on:submit|preventDefault={createGroup} class="flex flex-col gap-2">
			<input type="text" placeholder="제목 없음" bind:value={inputTitle} required />
			<div class="flex">
				<label
					class="bg-slate-100 px-2 py-1 rounded-l-lg ml-auto border-r cursor-pointer"
					for="image"
				>
					<input type="file" class="hidden" accept="image/*" bind:files={imageFiles} id="image" />
					이미지 업로드
					<p class="text-xs text-slate-500">용량제한: 1MB</p>
				</label>
				<button
					type="button"
					on:click={() => {
						imageFiles = undefined;
						previewGroup.image = 0;
					}}
					class="bg-slate-100 px-2 py-1 rounded-r-lg mr-auto">삭제</button
				>
			</div>
			<!-- <input type="text" placeholder="이미지" /> -->
			<div class="flex gap-1 h-20 bg-slate-100 rounded-lg p-1 overflow-x-scroll max-w-md">
				{#each inviteUsers as inviteUser, i}
					<div class="relative flex flex-col">
						<button
							class="absolute right-0 top-0 w-5 h-5"
							type="button"
							on:click={() => {
								inviteUsers.splice(i, 1);
								inviteUsers = inviteUsers;
							}}
							><svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								class="w-5 h-5 fill-slate-600"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
						<Image
							type={inviteUser.image}
							id={inviteUser.userid}
							size={12}
							seed={inviteUser.userid}
						/>
						<p>{inviteUser.username}</p>
					</div>
				{/each}
			</div>
			<UserSuggestion on:submit={inviteSubmit} input={true} />
			<button class="bg-slate-100 mx-auto px-2 py-1 rounded-full border-2" type="submit"
				>그룹 {isEdit ? '수정' : '생성'}</button
			>
		</form>
	</div>
</div>

<style lang="scss">
	.preview {
		@apply flex flex-col relative;

		&::after {
			content: '';
			width: 100%;
			height: 100%;
			background: linear-gradient(white, transparent, white);
			position: absolute;
			left: 0;
			top: 0;
		}
	}
</style>
