import type { Generated } from 'kysely';

interface User {
	id: string;
	usertag: string;
	username: string;
	biography: string;
	image: number;
	followerCount: number;
	followingCount: number;
	created: Generated<bigint>;
}

interface Key {
	id: string;
	hashed_password: string | null;
	user_id: string;
	primary: boolean;
}

interface Session {
	id: string;
	user_id: string;
	active_expires: bigint;
	idle_expires: bigint;
}

interface Monu {
	id: string;
	type: Generated<0 | 1>;
	topId: string | null;
	parentId: string | null;
	content: string;
	isMedia: Generated<boolean>;
	likedCount: Generated<number>;
	userId: string;
	imageCount: Generated<number>;
	created: Generated<bigint>;
}

interface Mention {
	monuId: string;
	userId: string;
	created: Generated<bigint>;
}

interface Monu_Hashtag {
	monuId: string;
	hashtagId: string;
}

interface Hashtag {
	id: string;
	name: string;
	count: Generated<number>;
}

interface User_User {
	fromUserId: string;
	toUserId: string;
	isListened: Generated<boolean>;
	created: Generated<bigint>;
}

interface likedMonu {
	userId: string;
	monuId: string;
	created: Generated<bigint>;
}

interface UserCanBuild {
	userid: string;
}

interface BuildCode {
	id: string;
	userId: string | null;
	count: number | null;
}

interface User_MessageGroup {
	userId: string;
	messageGroupId: string;
	created: Generated<bigint>;
}

interface MessageGroup {
	id: string;
	image: Generated<number>;
	title: string;
	created: Generated<bigint>;
}

interface Message {
	id: string;
	userId: string;
	content: string;
	messageGroupId: string;
	created: Generated<bigint>;
	type: 0 | 1 | 2;
}

export interface Database {
	user: User;
	key: Key;
	session: Session;
	Monu: Monu;
	Mention: Mention;
	Monu_Hashtag: Monu_Hashtag;
	Hashtag: Hashtag;
	User_User: User_User;
	likedMonu: likedMonu;
	UserCanBuild: UserCanBuild;
	BuildCode: BuildCode;
	User_MessageGroup: User_MessageGroup;
	MessageGroup: MessageGroup;
	Message: Message;
}
