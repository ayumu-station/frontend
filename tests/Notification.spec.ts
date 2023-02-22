/* eslint-disable no-constant-condition */
import { Notification, User } from '$lib/server/db';
import { expect, test, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.beforeEach(async ({ page }) => {
	await page.goto('/login');
	await page.getByLabel('유저태그').click();
	await page.getByLabel('유저태그').fill('playwright');
	await page.getByLabel('비밀번호').click();
	await page.getByLabel('비밀번호').fill('playwright');
	await page.getByRole('button', { name: '로그인' }).click();
});

test.describe('Read', () => {
	test('Default', async ({ page }) => {
		const id = await User.tagToId('playwright');
		const dbNotifications = await Notification.get(id, null, true);
		await page.goto(`/notifications`);
		await scrollPageEnded(page);
		for (let i = 0; i < dbNotifications.length; i++) {
			const pageNoti = page.getByRole('article').nth(i);
			await expect(pageNoti.getByRole('main')).toHaveText(
				getNotificationTitle(dbNotifications[i].type, dbNotifications[i].username)
			);
			await expect(pageNoti.getByRole('note')).toHaveText(dbNotifications[i].content);
		}
	});

	test('Mention', async ({ page }) => {
		const id = await User.tagToId('playwright');
		const dbNotifications = await Notification.getMention(id, null, true);
		await page.goto(`/notifications/mention`);
		await scrollPageEnded(page);
		for (let i = 0; i < dbNotifications.length; i++) {
			const pageNoti = page.getByRole('article').nth(i);
			await expect(pageNoti.getByRole('main')).toHaveText(
				getNotificationTitle(dbNotifications[i].type, dbNotifications[i].username)
			);
			await expect(pageNoti.getByRole('note')).toHaveText(dbNotifications[i].content);
		}
	});
});

const getNotificationTitle = (type: Client.NotificationType, username: string) => {
	let res = '';
	switch (type) {
		case 'newMonu':
			res = username + '님의 새로운 글이 올라왔습니다.';
			break;
		case 'likeMonu':
			res = username + '님이 좋아합니다.';
			break;
		case 'mention':
			res = username + '님이 멘션했습니다.';
			break;
		case 'replyMonu':
			res = username + '님이 답글을 올렸습니다.';
			break;
		case 'replyMentionedMonu':
			res = '멘션된 글에 ' + username + '님이 답글을 올렸습니다.';
			break;
	}
	return res;
};

async function scrollPageEnded(page: Page) {
	let height = await page.evaluate('window.innerHeight + window.pageYOffset');
	while (true) {
		await page.evaluate('window.scroll(0, window.innerHeight + window.pageYOffset)');
		await page.waitForLoadState('networkidle');
		const newHeight = await page.evaluate('window.innerHeight + window.pageYOffset');
		if (height === newHeight) {
			break;
		} else {
			height = newHeight;
		}
	}
}
