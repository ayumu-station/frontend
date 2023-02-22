<script lang="ts">
	import lexical from 'lexical';
	import {
		createEventDispatcher,
		onDestroy,
		onMount,
		SvelteComponentTyped,
		type ComponentType
	} from 'svelte';
	import RecommendNode from '$lib/Lexical/Recommend';
	export let type: string;
	export let prefix: string;
	export let editor: lexical.LexicalEditor;
	export let suggestion: ComponentType<
		SvelteComponentTyped<{
			list?: any[];
			selected?: number;
			value?: string;
		}>
	>;
	const { COMMAND_PRIORITY_NORMAL, TextNode } = lexical;
	let list: any[];
	export let key: string;
	export let isNewAllowed = false;
	let selected = 0;
	let events: (() => void)[] = [];
	let value = '';

	const dispatch = createEventDispatcher();

	onMount(() => {
		events.push(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					const selection = lexical.$getSelection();
					if (lexical.$isRangeSelection(selection)) {
						const node = editorState._nodeMap.get(selection.focus.key);
						if (node && node.getType() === 'recommend' && node.getSubtype() === type) {
							const content = node.getContent();
							value = content;
						} else {
							value = '';
						}
					}
				});
			})
		);

		events.push(
			editor.registerNodeTransform(TextNode, (textNode) => {
				const selection = lexical.$getSelection();
				if (lexical.$isRangeSelection(selection)) {
					const node = lexical.$getNodeByKey(selection.focus.key);
					const inputChar = node?.getTextContent().charAt(selection.focus.offset - 1);
					if (node && node.getType() === 'text' && inputChar === prefix) {
						const left = textNode.getTextContent().substring(0, selection.focus.offset - 1);
						const right = textNode.getTextContent().substring(selection.focus.offset);
						node.setTextContent(`${left} `);
						const recommendNode = new RecommendNode(prefix, type, prefix, (e) =>
							dispatch('click', e)
						);
						node.insertAfter(recommendNode);
						recommendNode.insertAfter(lexical.$createTextNode(` ${right}`));
						node.selectNext();
					}
				}
			})
		);

		events.push(
			editor.registerCommand(
				lexical.KEY_SPACE_COMMAND,
				(payload) => {
					editor.update(() => {
						const selection = lexical.$getSelection();
						if (lexical.$isRangeSelection(selection)) {
							const node = lexical.$getNodeByKey(selection.focus.key);
							if (node && node.getType() === 'recommend' && node.getSubtype() === type) {
								exitNode(node);
								payload?.preventDefault();
							}
						}
					});
					return false;
				},
				COMMAND_PRIORITY_NORMAL
			)
		);

		events.push(
			editor.registerCommand(
				lexical.KEY_ENTER_COMMAND,
				(payload) => {
					const selection = lexical.$getSelection();
					if (lexical.$isRangeSelection(selection)) {
						const node = lexical.$getNodeByKey(selection.focus.key);
						if (node?.getType() === 'recommend' && node.getSubtype() === type) {
							payload?.preventDefault();
							editor.update(() => {
								exitNode(node);
							});
							return true;
						}
					}
					return false;
				},
				COMMAND_PRIORITY_NORMAL
			)
		);

		events.push(
			editor.registerCommand(
				lexical.KEY_ARROW_DOWN_COMMAND,
				(payload) => {
					editor.update(() => {
						const selection = lexical.$getSelection();
						if (lexical.$isRangeSelection(selection)) {
							const node = lexical.$getNodeByKey(selection.focus.key);
							if (node?.getType() === 'recommend' && node.getSubtype() === type) {
								selected++;
								if (selected >= list.length) {
									selected = 0;
								}
								payload?.preventDefault();
							}
						}
					});
					return false;
				},
				COMMAND_PRIORITY_NORMAL
			)
		);

		events.push(
			editor.registerCommand(
				lexical.KEY_ARROW_UP_COMMAND,
				(payload) => {
					editor.update(() => {
						const selection = lexical.$getSelection();
						if (lexical.$isRangeSelection(selection)) {
							const node = lexical.$getNodeByKey(selection.focus.key);
							if (node?.getType() === 'recommend' && node.getSubtype() === type) {
								selected--;
								if (selected < 0) {
									selected = list.length - 1;
								}
								payload?.preventDefault();
							}
						}
					});
					return false;
				},
				COMMAND_PRIORITY_NORMAL
			)
		);
	});

	function exitNode(node: lexical.LexicalNode) {
		if (isNewAllowed || list.length > 0) {
			if (!isNewAllowed) node.setContent(list[selected][key]);
			if (node.__next) {
				const next = lexical.$getNodeByKey(node.__next) as lexical.TextNode;
				next.select(1, 1);
			} else {
				const tmp = lexical.$createTextNode(' ');
				node.insertAfter(tmp);
				tmp.selectNext();
			}
		} else {
			const tmp = lexical.$createTextNode(node.getTextContent());
			node.replace(tmp);
		}
	}

	onDestroy(() => {
		for (let i = 0; i < events.length; i++) {
			const unregister = events[i];
			unregister();
		}
	});

	function onSubmit(e: any) {
		editor.update(() => {
			const selection = lexical.$getSelection();
			if (lexical.$isRangeSelection(selection)) {
				const node = lexical.$getNodeByKey(selection.focus.key);
				if (node?.getType() === 'recommend' && node.getSubtype() === type) {
					node.setContent(e.detail[key]);
					const tmp = lexical.$createTextNode(' ');
					node.insertAfter(tmp);
					tmp.selectNext();
				}
			}
		});
	}
</script>

<div class="absolute top-full left-0 w-full bg-white">
	<!-- <Suggestion {value} bind:list {selected} /> -->
	<svelte:component this={suggestion} bind:list {selected} {value} on:submit={onSubmit} />
</div>
