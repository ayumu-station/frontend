/* eslint-disable no-constant-condition */
import { Hashtag, Monu } from '$lib/server/db';
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

test.describe('Create', () => {
	test('Build Monu', async ({ page }) => {
		await page.goto('/');
		await page.locator('form > div > div:nth-child(2) > div > div').first().click();
		await page.locator('form > div > div:nth-child(2) > div > div').first().type('테스트​');
		await page.locator('form > div > div:nth-child(2) > div > div').first().press('Enter');
		await page.locator('form > div > div:nth-child(2) > div > div').first().type('#테스트  @tes​');
		await page.getByText('테스트 @test', { exact: true }).click();
		await page
			.locator('form')
			.filter({ hasText: '테스트 #테스트 @test' })
			.getByRole('button')
			.nth(2)
			.click();
		await expect(page.getByRole('article').first().getByRole('main')).toHaveText(
			'테스트 #테스트 @test'
		);
	});

	test('Build Child Monu', async ({ page }) => {
		await page.goto('/u/playwright');
		await page.getByRole('article').first().getByRole('button').nth(1).click();
		const input = page
			.getByRole('dialog')
			.locator('form > div > div:nth-child(2) > div > div')
			.first();
		await input.type('답글 테스트');
		await input.press('Enter');
		await input.type('#테스트 @tes');
		await page.getByText('테스트 @test', { exact: true }).click();
		await page
			.getByRole('dialog')
			.locator('form')
			.filter({ hasText: '답글 테스트 #테스트 @test' })
			.getByRole('button')
			.nth(2)
			.click();
		await expect(page.getByRole('dialog').getByRole('article').nth(1).getByRole('main')).toHaveText(
			'답글 테스트 #테스트 @test'
		);
	});

	test('Like Monu', async ({ page }) => {
		const classList = (
			await page
				.getByRole('article')
				.first()
				.getByRole('button')
				.first()
				.locator('svg')
				.evaluate((e) => e.classList.toString())
		).split(' ');
		const colorClass = classList
			.find((className) => className.startsWith('hover:fill-'))
			?.replace('hover:', '');
		if (colorClass) {
			const isLiked = colorClass.includes(colorClass);
			await page.goto('/u/playwright');
			await page.getByRole('article').first().getByRole('button').first().click();

			if (isLiked) {
				await expect(
					page.getByRole('article').first().getByRole('button').first().locator('svg')
				).not.toHaveClass(colorClass);
			} else {
				await expect(
					page.getByRole('article').first().getByRole('button').first().locator('svg')
				).toHaveClass(colorClass);
			}
		}
	});
});

test.describe('Read', () => {
	test('Monu Page', async ({ page }) => {
		const dbUser = await prisma.user.findUnique({
			include: { monus: true },
			where: { usertag: 'playwright' }
		});
		if (dbUser) {
			const parentId = dbUser.monus[0].id;
			const dbMonus = await prisma.monu.findMany({
				where: { parentId },
				orderBy: { created: 'desc' }
			});
			await page.goto(`/monu/${dbUser.monus[0].id}`);
			await scrollPageEnded(page);
			for (let i = 0; i < dbMonus.length + 1; i++) {
				const pageMonu = page.getByRole('article').getByRole('main').nth(i);
				await expect(pageMonu).toHaveText(
					i === 0 ? dbUser.monus[0].content : dbMonus[i - 1].content
				);
			}
		}
	});

	test('Modal Monu', async ({ page }) => {
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
			const parentId = dbUser.monus[0].id;
			const dbMonus = await prisma.monu.findMany({
				where: { parentId },
				orderBy: { created: 'desc' }
			});
			await page.goto('/u/playwright');
			await page.getByRole('article').first().getByRole('button').nth(1).click({});
			// await page.getByRole('dialog').getByRole('main').is;
			const dialog = `document.querySelector('[role="dialog"]')`;
			let height = await page.evaluate(`${dialog}.scrollHeight`);
			while (true) {
				await page.evaluate(`${dialog}.scroll(0, ${dialog}.scrollHeight)`);
				const newHeight = await page.evaluate(`${dialog}.scrollHeight`);
				if (height === newHeight) {
					break;
				} else {
					height = newHeight;
				}
			}
			for (let i = 0; i < dbMonus.length + 1; i++) {
				const pageMonu = page.getByRole('dialog').getByRole('article').getByRole('main').nth(i);
				await expect(pageMonu).toHaveText(
					i === 0 ? dbUser.monus[0].content : dbMonus[i - 1].content
				);
			}
		}
	});

	test.describe('Search', () => {
		test('Default', async ({ page }) => {
			await page.goto(`/search?p=${encodeURIComponent('테스트')}`, { waitUntil: 'networkidle' });
			await scrollPageEnded(page);
			const monus = await Monu.search('테스트', undefined, undefined, true);

			for (let i = 0; i < monus.length; i++) {
				const pageMonu = page.getByRole('article').getByRole('main').nth(i);
				await expect(pageMonu).toHaveText(monus[i].content);
			}
		});

		test('Hashtag', async ({ page }) => {
			await page.goto(`/search?p=${encodeURIComponent('#테스트')}`, { waitUntil: 'networkidle' });
			await scrollPageEnded(page);
			const monus = await Hashtag.search('테스트', undefined, undefined, true);

			for (let i = 0; i < monus.length; i++) {
				const pageMonu = page.getByRole('article').getByRole('main').nth(i);
				await expect(pageMonu).toHaveText(monus[i].content);
			}
		});
	});
});

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
