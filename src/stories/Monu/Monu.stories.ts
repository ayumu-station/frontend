import type { Meta, StoryObj } from '@storybook/svelte';

import Monu from '$lib/components/Monu/SkeletonMonu.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta: Meta<Monu> = {
	title: 'Monu/Monu',
	component: Monu as any,
	tags: ['autodocs'],
	argTypes: {}
};

export default meta;
type Story = StoryObj<Monu>;

export const Base: Story = {
	args: {
		monu: {
			content: 'Hey, @username1\nThis is awesome Monu.\n#awesome',
			hashtag: ['awesome'],
			id: '1',
			image: null,
			liked: true,
			likedCount: 99,
			mention: ['username1'],
			timestamp: 1,
			usertag: 'haha',
			username: 'HAHA'
		} as Client.Monu,
		pos: 0 as number | undefined,
		loaded: true,
		comments: true
	}
};

export const Loading: Story = {
	args: {
		loaded: false
	}
};
