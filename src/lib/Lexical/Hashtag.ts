import lexical from 'lexical';
import type { NodeKey, EditorConfig } from 'lexical';

const { TextNode } = lexical;

export default class HashtagNode extends TextNode {
	constructor(text: string, key?: NodeKey) {
		super(text, key);
	}

	static getType(): string {
		return 'hashtag';
	}

	static clone(node: HashtagNode) {
		return new HashtagNode(node.__text, node.__key);
	}

	createDOM(config: EditorConfig) {
		const element = super.createDOM(config);
		element.style.fontWeight = '500';
		return element;
	}

	updateDOM(prevNode: HashtagNode, dom: HTMLElement, config: EditorConfig): boolean {
		const isUpdated = super.updateDOM(prevNode, dom, config);
		return isUpdated;
	}

	getHash() {
		return super.getTextContent().slice(1);
	}
}
