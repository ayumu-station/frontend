import type { Meta, StoryObj } from '@storybook/svelte';

import Message from '$lib/components/Message/Message.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta: Meta<Message> = {
	title: 'Message/Message',
	component: Message as any,
	tags: ['autodocs'],
	argTypes: {}
};

export default meta;
type Story = StoryObj<Message>;

export const Base: Story = {
	args: {
		message: {
			content: 'This is Message!',
			created: 10,
			id: 'temp',
			image: null,
			username: 'HAHA',
			usertag: 'haha'
		}
	}
};

// export const Loading: Story = {
// 	args: {}
// };
