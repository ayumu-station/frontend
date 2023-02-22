import lexical from 'lexical';
import type { NodeKey, EditorConfig } from 'lexical';

const { TextNode } = lexical;

export default class RecommendNode extends TextNode {
	__subtype: string;
	__prefix: string;
	__onclick?: (e: string) => void;

	constructor(
		text: string,
		subtype: string,
		prefix: string,
		onclick?: (e: string) => void,
		key?: NodeKey
	) {
		super(text, key);
		this.__subtype = subtype;
		this.__prefix = prefix;
		this.__onclick = onclick;
	}

	static getType(): string {
		return 'recommend';
	}

	static clone(node: RecommendNode) {
		return new RecommendNode(
			node.__text,
			node.__subtype,
			node.__prefix,
			node.__onclick,
			node.__key
		);
	}

	getSubtype(): string {
		return this.__subtype;
	}

	createDOM(config: EditorConfig) {
		const element = super.createDOM(config);
		element.style.fontWeight = '400';
		element.style.color = '#4287ff';
		if (this.__onclick) element.style.cursor = 'pointer';
		element.addEventListener('click', () => {
			if (this.__onclick) {
				this.__onclick(this.__text.replace(this.__prefix, ''));
			}
		});
		return element;
	}

	updateDOM(prevNode: RecommendNode, dom: HTMLElement, config: EditorConfig): boolean {
		const isUpdated = super.updateDOM(prevNode, dom, config);
		return isUpdated;
	}

	getContent() {
		return super.getTextContent().replace(this.__prefix, '');
	}

	setContent(value: string) {
		return super.setTextContent(`${this.__prefix}${value}`);
	}
}
