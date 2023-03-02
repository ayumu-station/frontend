<script lang="ts">
	import lexical from 'lexical';
	import { registerPlainText } from '@lexical/plain-text';
	import UserSuggestion from '../User/SkeletonSuggestion.svelte';
	import HashtagSuggestion from '../Hashtag/SkeletonSuggestion.svelte';
	import RecommendNode from '$lib/Lexical/Recommend';
	import {
		beforeUpdate,
		createEventDispatcher,
		onDestroy,
		onMount,
		SvelteComponentTyped,
		type ComponentType
	} from 'svelte';
	import Recommend from './Recommend.svelte';
	import { filterReg, filterRegRev } from '$lib/util';
	export let data = {
		text: '',
		mention: [] as string[],
		hashtag: [] as string[]
	};
	export let editable = false;
	export let suggestionHashtag: ComponentType<
		SvelteComponentTyped<{
			list?: any[];
			selected?: number;
			value?: string;
		}>
	> = HashtagSuggestion;
	export let suggestionMention: ComponentType<
		SvelteComponentTyped<{
			list?: any[];
			selected?: number;
			value?: string;
		}>
	> = UserSuggestion;

	const { LineBreakNode, ParagraphNode, TextNode } = lexical;

	let prevData: typeof data;
	let editorDiv: HTMLDivElement;
	let events: (() => void)[] = [];
	const config = {
		namespace: 'test',
		editable,
		error: console.error,
		nodes: [LineBreakNode, ParagraphNode, TextNode, RecommendNode]
	};
	let editor: lexical.LexicalEditor = lexical.createEditor(config);

	const dispatch = createEventDispatcher();

	onMount(() => {
		registerPlainText(editor);
		events.push(
			editor.registerNodeTransform(TextNode, (node) => {
				let content = node.getTextContent();
				if (!filterReg.test(content)) {
					let selection = lexical.$getSelection();
					content = content.replace(filterRegRev(), '');
					if (lexical.$isRangeSelection(selection)) {
						node.select(selection.anchor.offset - 1, selection.focus.offset - 1);
					}
					node.setTextContent(content);
				}
			})
		);

		events.push(
			editor.registerNodeTransform(RecommendNode, (node) => {
				let content = node.getTextContent();
				if (!filterReg.test(content)) {
					let selection = lexical.$getSelection();
					content = content.replace(filterRegRev(), '');
					node.setTextContent(content);
					if (lexical.$isRangeSelection(selection)) {
						node.select(selection.anchor.offset - 1, selection.focus.offset - 1);
					}
				}
			})
		);

		events.push(
			editor.registerTextContentListener((res) => {
				data.text = res;
				data.mention = [];
				data.hashtag = [];
				const editorState = editor.getEditorState();
				editorState.read(() => {
					const nodes = editorState._nodeMap.values();
					while (true) {
						const { value, done } = nodes.next();
						if (done) break;
						if (value.__type === 'recommend') {
							switch (value.__subtype) {
								case 'mention':
									data.mention.push(value.getContent());
									break;

								case 'hashtag':
									data.hashtag.push(value.getContent());
									break;

								default:
									break;
							}
						}
					}
				});
			})
		);
		editor.setRootElement(editorDiv);
	});

	beforeUpdate(() => {
		if (prevData !== data && !editable && data && data.text) {
			prevData = data;
			editor.update(() => {
				const root = lexical.$getRoot();
				const children = root.getChildren();
				for (let i = 0; i < children.length; i++) {
					const child = children[i];
					child.remove();
				}
				const paragraphNode = lexical.$createParagraphNode();
				const insertData = [
					...data.mention.map((v) => ({
						type: 'mention',
						data: `@${v}`,
						pos: data.text.indexOf(`@${v}`)
					})),
					...data.hashtag.map((v) => ({
						type: 'hashtag',
						data: `#${v}`,
						pos: data.text.indexOf(`#${v}`)
					}))
				].sort((a, b) => a.pos - b.pos);
				let text = data.text;
				for (let i = 0; i < insertData.length; i++) {
					const insert = insertData[i];
					const [prev, after] = text.split(insert.data);
					text = after;
					const textNode = lexical.$createTextNode(prev);
					paragraphNode.append(textNode);
					const recommendNode = new RecommendNode(
						insert.data,
						insert.type,
						insert.type === 'mention' ? '@' : '#',
						insert.type === 'mention'
							? (e) => dispatch('click:mention', e)
							: (e) => dispatch('click:hashtag', e)
					);
					paragraphNode.append(recommendNode);
				}
				const textNode = lexical.$createTextNode(text);
				paragraphNode.append(textNode);
				root.append(paragraphNode);
			});
		}
	});

	onDestroy(() => {
		for (let i = 0; i < events.length; i++) {
			const unregister = events[i];
			unregister();
		}
	});
</script>

<div class="w-full relative h-full">
	<div
		bind:this={editorDiv}
		role="main"
		class="w-full h-full outline-none"
		contenteditable={editable}
	/>
	{#if editable}
		<Recommend {editor} suggestion={suggestionMention} key="usertag" type="mention" prefix="@" />
		<Recommend
			{editor}
			suggestion={suggestionHashtag}
			key="name"
			type="hashtag"
			prefix="#"
			isNewAllowed={true}
		/>
	{/if}
</div>
