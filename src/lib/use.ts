export const click = (node: Element, callback: (() => void) | ((e: Event) => void)) => {
	node.addEventListener('click', callback);
	node.addEventListener('keyup', callback);

	return {
		destroy() {
			node.removeEventListener('click', callback);
			node.removeEventListener('keyup', callback);
		}
	};
};
