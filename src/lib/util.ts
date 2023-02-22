import type Rand from 'rand-seed';

export const getTimeString = (time: bigint, full = false) => {
	const date = new Date(Number(time));
	return {
		date: `${
			!full && date.getFullYear() === new Date().getFullYear() ? '' : `${date.getFullYear()}년 `
		}${date.getMonth() + 1}월 ${date.getDate()}일`,
		time: `${date.getHours().toString().padStart(2, '0')}:${date
			.getMinutes()
			.toString()
			.padStart(2, '0')}`
	};
};

export const randomColor = (rand: Rand) => Math.floor(rand.next() * 100 + 150);

export const randomRGB = (rand: Rand) =>
	[randomColor(rand), randomColor(rand), randomColor(rand)] as [number, number, number];

export const rgbToCss = (i: [number, number, number]) => `rgb(${i.join(',')})`;

export const randomGradient = (rand: Rand) =>
	`linear-gradient(45deg, ${rgbToCss(randomRGB(rand))}, ${rgbToCss(randomRGB(rand))})`;

export const tempMonu: () => Client.Monu = () => ({
	content: '',
	id: '',
	image: null,
	liked: false,
	likedCount: 0,
	created: BigInt(0),
	username: '',
	usertag: '',
	mention: [],
	hashtag: []
});

export const toPng = (base64: string) =>
	new Promise<string>((resolve, reject) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const img = new Image();
		img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx?.drawImage(img, 0, 0);
			const res = canvas.toDataURL('image/png');
			resolve(res);
		};
		img.onerror = () => reject();
		img.src = base64;
	});

export const fileToPng = (file: File) =>
	new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const base64 = reader.result as string;
			toPng(base64)
				.then((res) => {
					resolve(res);
				})
				.catch(reject);
		};
		reader.onerror = () => reject();
		reader.readAsDataURL(file);
	});

export const getNotificationTitle = (type: Client.NotificationType, username: string) => {
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

import Regenerate from 'regenerate';
import Format from 'regenerate-unicode-properties/General_Category/Format';
export const filterReg = new RegExp(
	'^(' + Regenerate().addRange(0x000000, 0x10ffff).remove(Format.characters) + ')+$'
);

// generation function because of g flag
export const filterRegRev = () => new RegExp(Regenerate().add(Format.characters).toString(), 'g');
