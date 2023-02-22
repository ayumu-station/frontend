import { customAlphabet, nanoid } from 'nanoid';
import { cast, connect } from '@planetscale/database';
import type { Connection, Transaction } from '@planetscale/database';
import { env } from '$env/dynamic/private';
import sql, * as sqls from 'sql-template-tag';

const conn = connect({
	url: env.DATABASE_URL,
	cast: (field, value) => {
		if (field.name === 'liked' || field.name === 'followed') {
			return value === '0' ? false : true;
		}
		return cast(field, value);
	}
});

async function query<Type>(conn: Connection | Transaction, query: sqls.Sql) {
	return (await conn.execute(query.sql, query.values, { as: 'object' })).rows as Type[];
}

async function execute(conn: Connection | Transaction, query: sqls.Sql) {
	return (await conn.execute(query.sql, query.values, { as: 'object' })).rowsAffected;
}

export type dbString = string | undefined | null;

const pagination = (full: boolean) => (full ? sqls.empty : sql`LIMIT 10`);

const fullSql = {
	usertagToId: (userTag: string) => sql`SELECT id FROM user WHERE usertag = ${userTag}`
};

const select = {
	simpleMonu: sql`m.content, m.id, m.likedCount, m.created, m.imageCount, m.parentId, m.topId, m.type`,
	monu: sql`u.id userid, u.username, u.image, u.usertag, m.content, m.id, m.likedCount, m.created, m.imageCount, m.parentId, m.topId, m.type`,
	mentionHashtag: sql`(SELECT GROUP_CONCAT(mention_user.usertag) FROM Mention mention JOIN user mention_user ON mention.userId = mention_user.id WHERE mention.monuId = m.id) mention,
	(SELECT GROUP_CONCAT(tag.name) FROM Monu_Hashtag monu_tag JOIN Hashtag tag ON tag.id = monu_tag.hashtagId WHERE monu_tag.monuId = m.id) hashtag`,
	likedMonu: (userId: dbString) =>
		userId ? sql`(CASE WHEN l.monuId IS NULL THEN FALSE ELSE TRUE END) liked` : sql`FALSE liked`,
	user: sql`u.id userid, u.username, u.image, u.usertag, u.biography, u.followerCount, u.followingCount, u.created`,
	followed: (userId: dbString) =>
		userId
			? sql`(CASE WHEN EXISTS (SELECT * FROM User_User uu WHERE uu.toUserId = u.id AND uu.fromUserId = ${userId}) THEN TRUE ELSE FALSE END) followed`
			: sql`0 followed`
};

const join = {
	likedMonu: (userId: dbString) =>
		userId ? sql`LEFT JOIN likedMonu l ON l.monuId = m.id AND l.userId = ${userId}` : sqls.empty,
	monuUser: sql`JOIN user u ON m.userId = u.id`
};

const where = {
	cursorMonu: (cursor: dbString) =>
		cursor
			? sql`(m.created, m.id) < ((SELECT created FROM Monu WHERE id = ${cursor}), ${cursor})`
			: sql`1`,
	cursorLikedMonu: (monuId: dbString, userTag: dbString) =>
		monuId && userTag
			? sql`(lm.created, lm.monuId, lm.userId) < ((SELECT created FROM likedMonu WHERE monuId = ${monuId} AND userId = (${fullSql.usertagToId(
					userTag
			  )})), ${monuId}, (${fullSql.usertagToId(userTag)}))`
			: sql`1`,
	cursorMention: (monuId: dbString, userTag: dbString) =>
		monuId && userTag
			? sql`(mention.created, mention.monuId, mention.userId) < ((SELECT created FROM Mention WHERE monuId = ${monuId} AND userId = (${fullSql.usertagToId(
					userTag
			  )})), ${monuId}, (${fullSql.usertagToId(userTag)}))`
			: sql`1`,
	onlyMedia: (bool: boolean) => (bool ? sql`m.isMedia` : sql`1`),
	withReply: (bool: boolean) =>
		!bool ? sql`((m.type = 0 AND m.parentId IS NULL) OR m.type = 1)` : sql`1`
};

const orderBy = {
	monu: sql`ORDER BY m.created DESC`
};

const parseArrayMonu = (res: DB.UnfixedMonu[]): DB.Monu[] => {
	return res.map((monu) => parseMonu(monu));
};

const parseMonu = (res: DB.UnfixedMonu): DB.Monu => {
	const fixed: DB.Monu & {
		parentId?: string | null;
		topId?: string | null;
	} = {
		...res,
		mention: res.mention ? res.mention.split(',') : [],
		hashtag: res.hashtag ? res.hashtag.split(',') : []
	};
	delete fixed.parentId;
	delete fixed.topId;
	return fixed;
};

async function fetchTopAndParentMonu(monus: DB.UnfixedMonu[], userId: dbString) {
	const fixedMonus = parseArrayMonu(monus);
	const topAndParentIds = new Set();
	for (let u = 0; u < monus.length; u++) {
		const monu = monus[u];
		if (monu.parentId) topAndParentIds.add(monu.parentId);
		if (monu.topId) topAndParentIds.add(monu.topId);
	}

	const topAndParentMonus =
		topAndParentIds.size > 0
			? parseArrayMonu(
					await query<DB.UnfixedMonu>(
						conn,
						sql`
						SELECT ${select.monu}, ${select.likedMonu(userId)}, ${select.mentionHashtag}
						FROM Monu m
						${join.monuUser}
						${join.likedMonu(userId)}
						WHERE m.id IN (${sqls.join(Array.from(topAndParentIds))})
						`
					)
			  )
			: [];

	const monusWithTopAndParent: Client.Monu[] = [];
	for (let i = 0; i < monus.length; i++) {
		const { parentId, topId } = monus[i];
		const parent = topAndParentMonus.find((m) => m.id === parentId);
		const top = topAndParentMonus.find((m) => m.id === topId);
		monusWithTopAndParent.push({
			...fixedMonus[i],
			parent: parent ? { ...parent, parent: undefined, top: undefined } : undefined,
			top: top ? { ...top, parent: undefined, top: undefined } : undefined
		});
	}

	return monusWithTopAndParent;
}

export const Monu = {
	async build(
		type: 'default' | 'quote',
		userId: string,
		content: string,
		parentId: string | null = null,
		mention: Set<string> = new Set(),
		hashtag: Set<string> = new Set(),
		imageCount = 0
	) {
		const id = nanoid();
		const reg = /\[youtube]\((.*?)\)|\[image]\((.*?)\)/g;
		parentId = parentId ? parentId : null;
		const medias = content.match(reg);
		const isMedia = imageCount > 0 || (medias !== null && medias.length > 0);
		const typeNum = type === 'default' ? 0 : 1;
		const res = await conn.transaction(async (tx) => {
			const topId = await query<{ topId: string | null }>(
				tx,
				sql`SELECT IFNULL((SELECT topId FROM Monu WHERE id = ${parentId}), ${parentId}) topId`
			);

			await query(
				tx,
				sql`
				INSERT INTO Monu (type, id, topId, parentId, content, isMedia, userId, imageCount)
				VALUES (${typeNum}, ${id}, ${topId[0].topId}, ${parentId}, ${content}, ${isMedia}, ${userId}, ${imageCount})`
			);

			if (mention.size > 0) {
				await query(
					tx,
					sql`
					INSERT INTO Mention (monuId, userId)
					SELECT ${id}, id FROM user WHERE usertag IN (${sqls.join(Array.from(mention))})`
				);
			}

			if (hashtag.size > 0) {
				const hashtags = Array.from(hashtag);
				await query(
					tx,
					sql`
					INSERT IGNORE INTO Hashtag (id, name)
					VALUES ${sqls.join(hashtags.map((tag) => sql`(${nanoid()}, ${tag})`))}`
				);

				await query(
					tx,
					sql`
					INSERT INTO Monu_Hashtag (monuId, hashtagId)
					SELECT ${id}, id FROM Hashtag WHERE name IN (${sqls.join(hashtags)})`
				);

				await query(
					tx,
					sql`UPDATE Hashtag SET count = count + 1 WHERE name IN (${sqls.join(
						Array.from(hashtag)
					)})`
				);
			}

			return await query<DB.UnfixedMonu>(
				tx,
				sql`
				SELECT ${select.monu}, 0 liked, ${select.mentionHashtag}
				FROM Monu m
				JOIN user u ON u.id = m.userId
				WHERE m.id = ${id}`
			);
		});
		return (await fetchTopAndParentMonu(res, userId))[0];
	},
	async get(id: string, userId: dbString = undefined) {
		const res = await query<DB.UnfixedMonu>(
			conn,
			sql`
			SELECT ${select.monu}, ${select.likedMonu(userId)}, ${select.mentionHashtag}
			FROM Monu m
			${join.monuUser}
			${join.likedMonu(userId)}
			WHERE m.id = ${id}
			`
		);
		return (await fetchTopAndParentMonu(res, userId))[0];
	},
	async gets(ids: string[], cursor: dbString = null, userId: dbString = undefined) {
		// Need BOOLEAN Result from SQL EXISTS Statement without using a WHERE Clause
		// https://stackoverflow.com/a/40616379
		const res = await query<DB.UnfixedMonu>(
			conn,
			sql`
			SELECT ${select.monu}, ${select.likedMonu(userId)}, ${select.mentionHashtag}
			FROM Monu m
			${join.monuUser}
			${join.likedMonu(userId)}
			WHERE m.id IN (${sqls.join(ids)})
			`
		);
		return await fetchTopAndParentMonu(res, userId);
	},
	async getRecent(cursor: dbString = undefined, userId: dbString = undefined, full = false) {
		const res = await query<DB.UnfixedMonu>(
			conn,
			sql`
			SELECT ${select.monu}, ${select.likedMonu(userId)}, ${select.mentionHashtag}
			FROM Monu m
			${join.monuUser}
			${join.likedMonu(userId)}
			WHERE ${where.cursorMonu(cursor)}
			${orderBy.monu}
			${pagination(full)}
		`
		);

		return await fetchTopAndParentMonu(res, userId);
	},
	async like(monuId: string, userId: string, like: boolean) {
		try {
			const res = await conn.transaction(async (tx) => {
				const likeRes = like
					? await execute(
							tx,
							sql`INSERT IGNORE INTO likedMonu (monuId, userId) VALUES (${monuId}, ${userId})`
					  )
					: await execute(
							tx,
							sql`DELETE FROM likedMonu WHERE monuId = ${monuId} AND userId = ${userId}`
					  );
				if (likeRes === 1) {
					const updateCountRes = like
						? await execute(
								tx,
								sql`UPDATE Monu SET likedCount = likedCount + 1 WHERE id = ${monuId}`
						  )
						: await execute(
								tx,
								sql`UPDATE Monu SET likedCount = likedCount - 1 WHERE id = ${monuId}`
						  );
					if (updateCountRes === 1) {
						return await query<{ likedCount: number; userId: string }>(
							tx,
							sql`SELECT likedCount, userId FROM Monu WHERE id = ${monuId}`
						);
					}
				}
				throw new Error();
			});
			return res[0];
		} catch {
			return { likedCount: -1, userId: '' };
		}
	},
	async getChilds(
		id: string,
		cursor: dbString = undefined,
		userId: dbString = undefined,
		full = false
	) {
		const res = await query<DB.UnfixedMonu>(
			conn,
			sql`
			SELECT ${select.monu}, ${select.likedMonu(userId)}, ${select.mentionHashtag}
			FROM Monu m
			${join.monuUser}
			${join.likedMonu(userId)}
			WHERE parentId = ${id}
			AND ${where.cursorMonu(cursor)}
			${orderBy.monu}
			${pagination(full)}
			`
		);
		return await fetchTopAndParentMonu(res, userId);
	},
	async search(
		searchTerm: string,
		cursor: dbString = undefined,
		userId: dbString = undefined,
		full = false
	) {
		const res = await query<DB.UnfixedMonu>(
			conn,
			sql`
			SELECT ${select.monu}, ${select.likedMonu(userId)}, ${select.mentionHashtag}
			FROM Monu m
			${join.monuUser}
			${join.likedMonu(userId)}
			WHERE MATCH(content) AGAINST(${searchTerm} IN BOOLEAN MODE)
			AND ${where.cursorMonu(cursor)}
			${orderBy.monu}
			${pagination(full)}
			`
		);
		return await fetchTopAndParentMonu(res, userId);
	}
};

export const Notification = {
	async get(userId: string, cursors: null | [number, string, string] = null, full = false) {
		return await query<Client.Notification>(
			conn,
			sql`
			SELECT created, type, content, usertag, username, userid, image, monuId
			FROM Notification
			WHERE targetUserId = ${userId}
			${cursors ? sql`AND (created, monuId, type) < (${sqls.join(cursors)})` : sqls.empty}
			ORDER BY created DESC
			${pagination(full)}
			`
		);
	},
	async getWithMonu(userId: string, cursor: dbString = null, full = false) {
		const res = await query<Client.MonuNotification>(
			conn,
			sql`
			SELECT n.id notificationId, n.created, n.type, ${select.monu}, ${select.likedMonu(userId)}, ${
				select.mentionHashtag
			}
			FROM Notification n
			JOIN Monu m ON m.id = n.monuId
			JOIN user u ON u.id = m.userId
			${join.likedMonu(userId)}
			WHERE (n.userId IN (SELECT toUserId FROM User_User WHERE fromUserId = ${userId}) OR 
			((m.userId = ${userId} OR m.id IN (SELECT monuId FROM Mention WHERE userid = ${userId})) AND n.type != 'newMonu'))
			AND (CASE WHEN ${cursor} IS NULL THEN 1 ELSE (n.created, n.id) < ((SELECT created FROM Notification WHERE id = ${cursor}),  ${cursor}) END)
			GROUP BY n.id
			ORDER BY n.created DESC
			${pagination(full)}
		`
		);

		return parseArrayMonu(res);
	},
	async getMention(userId: string, cursors: null | [number, string] = null, full = false) {
		return await query<Client.Notification>(
			conn,
			sql`
			SELECT mention.created, 'mention' type, m2.content, u2.id userid, u2.usertag, u2.username, u2.image, mention.monuId
			FROM Mention mention
			LEFT JOIN Monu m2 ON m2.id = mention.monuId
			LEFT JOIN user u2 ON u2.id = m2.userId
			WHERE mention.userId = ${userId}
			${cursors ? sql`AND (mention.created, mention.monuId) < (${sqls.join(cursors)})` : sqls.empty}
			ORDER BY mention.created DESC
			${pagination(full)}`
		);
	}
};

export const User = {
	async getByTag(userTag: string, sessionUserId: dbString = undefined) {
		const [res] = await query<Client.User>(
			conn,
			sql`
			SELECT DISTINCT ${select.user}, ${select.followed(sessionUserId)}
			FROM user u
			WHERE u.usertag = ${userTag}
			`
		);
		return res;
	},

	async getMonus(
		userId: string,
		sessionUserId: dbString = undefined,
		onlyMedia = false,
		cursor: dbString = undefined,
		full = false
	) {
		const res = await query<DB.UnfixedMonu>(
			conn,
			sql`
			SELECT ${select.monu}, ${select.likedMonu(userId)}, ${select.mentionHashtag}
			FROM Monu m
			${join.monuUser}
			${join.likedMonu(sessionUserId)}
			WHERE m.userId = ${userId}
			AND ${where.cursorMonu(cursor)}
			AND ${where.onlyMedia(onlyMedia)}
			${orderBy.monu}
			${pagination(full)}
			`
		);

		return await fetchTopAndParentMonu(res, sessionUserId);
	},

	async getMonusByTag(
		userTag: string,
		sessionUserId: dbString = undefined,
		onlyMedia = false,
		withReply = false,
		cursor: dbString = undefined,
		full = false
	) {
		const res = await query<DB.UnfixedMonu>(
			conn,
			sql`
			SELECT ${select.monu}, ${select.likedMonu(sessionUserId)}, ${select.mentionHashtag}
			FROM Monu m
			${join.monuUser}
			${join.likedMonu(sessionUserId)}
			WHERE m.userId = (${fullSql.usertagToId(userTag)})
			AND ${where.cursorMonu(cursor)}
			AND ${where.onlyMedia(onlyMedia)}
			AND ${where.withReply(withReply)}
			${orderBy.monu}
			${pagination(full)}
			`
		);

		return await fetchTopAndParentMonu(res, sessionUserId);
	},
	async follow(fromId: string, toTag: string, follow: boolean) {
		try {
			const res = await conn.transaction(async (tx) => {
				const followRes = follow
					? await execute(
							tx,
							sql`INSERT IGNORE INTO User_User (fromUserId, toUserId) VALUES (${fromId}, (SELECT id FROM user WHERE usertag = ${toTag}))`
					  )
					: await execute(
							tx,
							sql`DELETE FROM User_User WHERE toUserId = (SELECT id FROM user WHERE usertag = ${toTag}) AND fromUserId = ${fromId}`
					  );
				if (followRes === 1) {
					const updateFollowingCountRes = follow
						? await execute(
								tx,
								sql`UPDATE User SET followingCount = followingCount + 1 WHERE id = ${fromId}`
						  )
						: await execute(
								tx,
								sql`UPDATE User SET followingCount = followingCount - 1 WHERE id = ${fromId}`
						  );
					if (updateFollowingCountRes === 1) {
						const updateFollowerCountRes = follow
							? await execute(
									tx,
									sql`UPDATE User SET followerCount = followerCount + 1 WHERE usertag = ${toTag}`
							  )
							: await execute(
									tx,
									sql`UPDATE User SET followerCount = followerCount - 1 WHERE usertag = ${toTag}`
							  );
						if (updateFollowerCountRes === 1) {
							const res = await query<{ followerCount: number }>(
								tx,
								sql`SELECT followerCount FROM user WHERE usertag = ${toTag}`
							);

							return res[0].followerCount;
						}
					}
				}
				throw new Error();
			});
			return res;
		} catch {
			return -1;
		}
	},
	async getFollow(
		type: 'follower' | 'following',
		userTag: string,
		sessionUserId: dbString = undefined,
		cursor: dbString = null,
		full = false
	) {
		const joinWhere =
			type === 'follower'
				? sql`
				ON u.id = uu.fromUserId
				WHERE uu.toUserId = (SELECT u2.id FROM user u2 WHERE u2.usertag = ${userTag})
				AND (CASE WHEN ${cursor} IS NULL THEN 1 ELSE uu.fromUserId < (SELECT u2.id FROM user u2 WHERE u2.usertag = ${cursor}) END)
				ORDER BY uu.fromuserId DESC`
				: sql`
				ON u.id = uu.toUserId
				WHERE uu.fromUserId = (SELECT u2.id FROM user u2 WHERE u2.usertag = ${userTag})
				AND (CASE WHEN ${cursor} IS NULL THEN 1 ELSE uu.toUserId < (SELECT u2.id FROM user u2 WHERE u2.usertag = ${cursor}) END)
				ORDER BY uu.toUserId DESC`;

		const res = await query<Client.User>(
			conn,
			sql`
			SELECT ${select.user}, ${select.followed(sessionUserId)}
			FROM User_User uu
			JOIN user u ${joinWhere}
			${pagination(full)}
			`
		);

		return res;
	},
	async getLikedMonus(
		userTag: string,
		sessionUserId: string | undefined = undefined,
		cursor: string | undefined = undefined,
		full = false
	) {
		const cursorSql = cursor ? sql`lm2.created < ${cursor}` : sql`1`;
		const res = await query<DB.UnfixedMonu>(
			conn,
			sql`
			SELECT ${select.monu}, ${select.likedMonu(sessionUserId)}, ${select.mentionHashtag}
			FROM likedMonu lm2
			JOIN Monu m ON m.id = lm2.monuId
			${join.monuUser}
			${join.likedMonu(sessionUserId)}
			WHERE lm2.userId = (${fullSql.usertagToId(userTag)})
			AND ${cursorSql}
			ORDER BY lm2.created DESC
			${pagination(full)}
			`
		);
		return await fetchTopAndParentMonu(res, sessionUserId);
	},

	async suggestion(q: string) {
		q += '%';
		return await query<Client.SimpleUser>(
			conn,
			sql`
			SELECT usertag, image, username
			FROM user
			WHERE usertag LIKE ${q}
			LIMIT 5
			`
		);
	},

	async tagToId(usertag: string) {
		return (
			await query<{ id: string }>(conn, sql`SELECT id FROM user WHERE usertag = ${usertag}`)
		)[0].id;
	},
	async getFollowedInFollowing(from: string, to: string, full = false) {
		return await query<Client.SimpleUser>(
			conn,
			sql`
			SELECT u.usertag, u.username, u.id userid, u.image
			FROM User_User a, User_User b
			JOIN user u ON u.id = b.fromUserId
			WHERE a.fromUserId = ${from} AND b.fromUserId = a.toUserId AND b.toUserId = ${to}
			${full ? sqls.empty : sql`LIMIT 5`}`
		);
	}
};

export const Message = {
	async getGroups(userId: string) {
		return await query<Client.MessageGroup>(
			conn,
			sql`
			SELECT mg.id, mg.image, mg.title, umg.created joined, mg.created, m.content latestMessage, m.created updated
			FROM User_MessageGroup umg
			JOIN MessageGroup mg ON mg.id = umg.messageGroupId
			LEFT JOIN Message m ON m.id = (SELECT id FROM Message WHERE messageGroupId = umg.messageGroupId AND type = 0 ORDER BY created DESC LIMIT 1)
			WHERE umg.userId = ${userId}
			ORDER BY CASE WHEN m.created IS NOT NULL THEN m.created ELSE mg.created END DESC
			`
		);
	},
	async getGroupMessages(userId: string, groupId: string, cursor: dbString = null) {
		const cursorSql = cursor
			? sql`(m.created, m.id) < ((SELECT created FROM Message WHERE id = ${cursor}), ${cursor})`
			: sql`1`;

		return await query<Client.Message>(
			conn,
			sql`
			SELECT m.id, u.username, u.usertag, u.image, u.id userid, m.content, m.created, m.type
			FROM Message m
			JOIN user u ON u.id = m.userId 
			WHERE EXISTS (SELECT messageGroupId FROM User_MessageGroup WHERE userId = ${userId} AND messageGroupId = ${groupId}) AND m.messageGroupId = ${groupId} AND ${cursorSql}
			ORDER BY created DESC
			LIMIT 30
			`
		);
	},
	async getGroupUsers(groupId: string) {
		return await query<Client.GroupUser>(
			conn,
			sql`
			SELECT u.username, u.usertag, u.id userid, u.image, umg.created
			FROM MessageGroup mg
			JOIN User_MessageGroup umg ON umg.messageGroupId = mg.id 
			JOIN user u ON u.id = umg.userId
			WHERE mg.id = ${groupId}
			`
		);
	}
};

export const Hashtag = {
	async suggestion(q: string) {
		q += '%';
		return await query<Client.Hashtag>(
			conn,
			sql`
			SELECT id, name, count
			FROM Hashtag
			WHERE name LIKE ${q}
			LIMIT 5`
		);
	},
	async get(name: string) {
		const [res] = await query<Client.Hashtag>(
			conn,
			sql`
			SELECT id, name, count
			FROM Hashtag
			WHERE name = ${name}`
		);
		return res;
	},
	async search(
		searchTerm: string,
		cursor: dbString = undefined,
		userId: dbString = undefined,
		full = false
	) {
		const res = await query<DB.UnfixedMonu>(
			conn,
			sql`
			SELECT ${select.monu}, ${select.likedMonu(userId)}, ${select.mentionHashtag}
			FROM Monu_Hashtag mh
			JOIN Monu m ON mh.monuId = m.id
			${join.monuUser}
			${join.likedMonu(userId)}
			WHERE mh.hashtagId = (SELECT id FROM Hashtag WHERE name = ${searchTerm})
			AND ${where.cursorMonu(cursor)}
			${orderBy.monu}
			${pagination(full)}`
		);
		return await fetchTopAndParentMonu(res, userId);
	}
};

export const BuildCode = {
	async checkCanCreate(userId: string) {
		const res = await query<{ userId: string }>(
			conn,
			sql`
			SELECT userId
			FROM UserCanBuild
			WHERE userId = ${userId}`
		);

		return res.length === 1;
	},

	async createBuildCode(userId: string) {
		const createId = customAlphabet('0123456789QWERTYUIOPASDFGHJKLZXCVBNM', 6);
		let id = createId();
		let isUnique = false;
		while (!isUnique) {
			const find = await query(conn, sql`SELECT 1 FROM buildCode WHERE id = ${id}`);

			if (find.length > 0) {
				id = createId();
			} else {
				isUnique = true;
				break;
			}
		}

		await execute(conn, sql`INSERT INTO buildCode (id, userId) VALUES (${id}, ${userId})`);

		return { buildCode: { id, userId } };
	},

	async deleteBuildCode(id: string) {
		return await execute(conn, sql`DELETE FROM buildCode WHERE id = ${id}`);
	},

	async getBuildCode(id: string) {
		const res = await query(conn, sql`SELECT * FROM buildCode WHERE id = ${id}`);
		return res.length > 0 ? res[0] : null;
	},

	async getBuildCodesByUser(userId: string) {
		const res = await query(conn, sql`SELECT * FROM buildCode WHERE userId = ${userId}`);

		return res;
	}
};
