declare namespace DB {
	interface UnfixedMonu extends Client.OnlyMonu, Client.SimpleUser {
		mention: string;
		hashtag: string;
		parentId: string | null;
		topId: string | null;
	}

	interface Monu extends Client.OnlyMonu, Client.SimpleUser {}
}
