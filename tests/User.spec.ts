/* eslint-disable no-constant-condition */
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
	test.describe('User Page', () => {
		test('Monu', async ({ page }) => {
			const dbUser = await prisma.user.findUnique({
				include: {
					monus: {
						orderBy: { created: 'desc' },
						where: { parentId: null }
					}
				},
				where: { usertag: 'playwright' }
			});
			if (dbUser) {
				await page.goto('/u/playwright', { waitUntil: 'networkidle' });
				await scrollPageEnded(page);
				for (let i = 0; i < dbUser.monus.length; i++) {
					const pageMonu = page.getByRole('article').getByRole('main').nth(i);
					await expect(pageMonu).toHaveText(dbUser.monus[i].content);
				}
			}
		});

		test('Monu & Reply', async ({ page }) => {
			const dbUser = await prisma.user.findUnique({
				include: {
					monus: {
						orderBy: { created: 'desc' }
					}
				},
				where: { usertag: 'playwright' }
			});
			if (dbUser) {
				await page.goto('/u/playwright/with_replies', { waitUntil: 'networkidle' });
				await scrollPageEnded(page);
				for (let i = 0; i < dbUser.monus.length; i++) {
					const pageMonu = page.getByRole('article').getByRole('main').nth(i);
					await expect(pageMonu).toHaveText(dbUser.monus[i].content);
				}
			}
		});

		test.fixme('Media', async ({ page }) => {
			//
		});

		test('Liked Monu', async ({ page }) => {
			const dbMonus = await prisma.likedMonu.findMany({
				include: { monu: true },
				where: {
					user: { usertag: 'playwright' }
				}
			});
			if (dbMonus) {
				await page.goto('/u/playwright/with_replies', { waitUntil: 'networkidle' });
				await scrollPageEnded(page);
				for (let i = 0; i < dbMonus.length; i++) {
					const pageMonu = page.getByRole('article').getByRole('main').nth(i);
					await expect(pageMonu).toHaveText(dbMonus[i].monu.content);
				}
			}
		});
	});
});

async function scrollPageEnded(page: Page) {
	let height = await page.evaluate(
		'document.getElementsByClassName("os-viewport")[0].scrollHeight'
	);
	while (true) {
		await page.evaluate(`document.getElementsByClassName("os-viewport")[0].scroll(0, ${height})`);
		await page.waitForLoadState('networkidle');
		const newHeight = await page.evaluate(
			'document.getElementsByClassName("os-viewport")[0].scrollHeight'
		);
		if (height === newHeight) {
			break;
		} else {
			height = newHeight;
		}
	}
}
