import type { Meta, StoryObj } from '@storybook/svelte';

import List from '$lib/components/Monu/SkeletonList.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta: Meta<List> = {
	title: 'Monu/List',
	component: List as any,
	tags: ['autodocs'],
	argTypes: {}
};

export default meta;
type Story = StoryObj<List>;

export const Base: Story = {
	args: {
		monus: Array(3).fill({
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
		}),
		loadCount: 5
	}
};

export const Loading: Story = {
	args: {
		monus: [],
		loadCount: 5
	}
};
