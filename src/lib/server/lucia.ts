import lucia from 'lucia-auth';
import { default as kysely, type KyselyLuciaDatabase } from '@lucia-auth/adapter-kysely';
import { PlanetScaleDialect } from 'kysely-planetscale';
import { Kysely } from 'kysely';
import { dev } from '$app/environment';
import { nanoid } from 'nanoid/async';
import { env } from '$env/dynamic/private';

const db = new Kysely<KyselyLuciaDatabase>({
	dialect: new PlanetScaleDialect({
		url: env.DATABASE_URL
	})
});

export const auth = lucia({
	adapter: kysely(db, 'mysql2'),
	env: dev ? 'DEV' : 'PROD',
	transformUserData: (userData) => {
		return {
			userid: userData.id,
			usertag: userData.usertag,
			username: userData.username,
			biography: userData.biography,
			image: userData.image,
			created: userData.created,
			followerCount: userData.followerCount,
			followingCount: userData.followingCount
		};
	},
	generateCustomUserId: () => nanoid(),
	...(env.ENV === 'dev' ? {} : { sessionCookie: [{ domain: 'mokastation.space' }] })
});
export type Auth = typeof auth;
