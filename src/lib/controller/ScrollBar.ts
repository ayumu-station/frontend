import type { OnUpdatedEventListenerArgs, OverlayScrollbars } from 'overlayscrollbars';
import { writable } from 'svelte/store';

export const scrollEnded = writable(false);

export const overflowed = writable(false);

export function onScroll(e: CustomEvent<[instance: OverlayScrollbars, event: Event]>) {
	const target = e.detail[1].target as HTMLElement;
	if (target.scrollHeight - (target.scrollTop + target.clientHeight) <= 10) {
		scrollEnded.set(true);
	} else {
		scrollEnded.set(false);
	}
}

export function onUpdate(
	e: CustomEvent<[instance: OverlayScrollbars, onUpdatedArgs: OnUpdatedEventListenerArgs]>
) {
	overflowed.set(e.detail[0].state().hasOverflow.y);
}
