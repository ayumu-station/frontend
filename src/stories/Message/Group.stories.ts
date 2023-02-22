import type { Meta, StoryObj } from '@storybook/svelte';

import Group from '$lib/components/Message/Group.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta: Meta<Group> = {
	title: 'Message/Group',
	component: Group as any,
	tags: ['autodocs'],
	argTypes: {}
};

export default meta;
type Story = StoryObj<Group>;

export const Base: Story = {
	args: {
		selected: false,
		group: {
			id: 'temp',
			image: 0,
			title: 'Title',
			created: 0,
			latestMessage: 'This is Message',
			updated: 10
		}
	}
};

export const Selected: Story = {
	args: {
		selected: true,
		group: {
			id: 'temp',
			image: 0,
			title: 'Title',
			created: 0,
			latestMessage: 'This is Message',
			updated: 10
		}
	}
};

export const Loading: Story = {
	args: {}
};
