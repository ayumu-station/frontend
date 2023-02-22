import type { Meta, StoryObj } from '@storybook/svelte';

import Build from '$lib/components/Monu/SkeletonBuild.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta: Meta<Build> = {
	title: 'Monu/Build',
	component: Build as any,
	tags: ['autodocs'],
	argTypes: {}
};

export default meta;
type Story = StoryObj<Build>;

export const Base: Story = {
	args: {
		user: { biography: '', image: null, userid: 'HAHA', username: 'HAHA', usertag: 'haha' }
	}
};

export const Opend: Story = {
	args: {
		user: { biography: '', image: null, userid: 'HAHA', username: 'HAHA', usertag: 'haha' },
		opened: true
	}
};
