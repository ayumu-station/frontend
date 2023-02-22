// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
// declare namespace App {
// interface Locals {}
// interface PageData {}
// interface Error {}
// interface Platform {}
// }

/// <reference types="lucia-auth" />

declare namespace Lucia {
	type Auth = import('$lib/server/lucia').Auth;
	type UserAttributes = {
		userid?: string;
		usertag: string;
		username: string;
		image?: number;
		biography?: string;
		created?: bigint;
		followerCount?: number;
		followingCount?: number;
	};
}

/// <reference types="@sveltejs/kit" />
declare namespace App {
	interface Locals {
		// getSession: import('@lucia-auth/sveltekit').GetSession;
		// getSessionUser: import('@lucia-auth/sveltekit').GetSessionUser;
		// setSession: import('@lucia-auth/sveltekit').SetSession;
		validate: import('@lucia-auth/sveltekit').Validate;
		validateUser: import('@lucia-auth/sveltekit').ValidateUser;
		setSession: import('@lucia-auth/sveltekit').SetSession;
	}
}

declare namespace Client {
	interface SimpleUser {
		image: number;
		userid: string;
		username: string;
		usertag: string;
	}

	interface User extends SimpleUser {
		biography: string;
		followerCount: number;
		followingCount: number;
		followed: boolean;
		created: bigint;
	}

	interface UserFull extends User {
		monus: SimpleMonu[];
	}

	interface GroupUser extends SimpleUser {
		created: bigint;
	}

	interface OnlyMonu {
		created: bigint;
		likedCount: number;
		content: string;
		id: string;
		liked: boolean;
		mention: string[];
		hashtag: string[];
		imageCount: number;
		type: 0 | 1;
	}

	interface SimpleMonu extends OnlyMonu {
		parent: Client.Monu | undefined;
		top: Client.Monu | undefined;
	}

	interface Monu extends SimpleUser, SimpleMonu {}

	interface MonuFull extends Monu {
		child: Monu[];
	}

	type NotificationType = 'newMonu' | 'likeMonu' | 'mention' | 'replyMonu' | 'replyMentionedMonu';

	interface MonuNotification extends Monu {
		type: NotificationType;
	}

	interface Notification extends SimpleUser {
		created: bigint;
		type: NotificationType;
		content: string;
		monuId: string;
	}

	interface MonuRecommended extends Monu {
		base: User | undefined;
		baseType: 'liked' | 'follow' | 'highLiked';
	}

	interface Toast {
		type: 'success' | 'error';
		message: string;
	}

	interface MessageGroup {
		id: string;
		image: 0 | 1 | string;
		title: string;
		created: bigint;
		latestMessage: string | null;
		updated: bigint | null;
	}

	interface Message extends SimpleUser {
		type: 0 | 1 | 2;
		id: string;
		content: string;
		created: bigint;
	}

	interface Hashtag {
		id: string;
		name: string;
		count: number;
	}

	interface MonuData {
		text: string;
		mention: string[];
		hashtag: string[];
	}
}
