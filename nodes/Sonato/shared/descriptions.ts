import type { INodeProperties } from 'n8n-workflow';

export const postSelect: INodeProperties = {
	displayName: 'Post',
	name: 'post',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: 'The post to act on',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a post...',
			typeOptions: {
				searchListMethod: 'getPosts',
				searchable: true,
			},
		},
		{
			displayName: 'By ID',
			name: 'id',
			type: 'string',
			placeholder: 'e.g. post_example01',
		},
	],
};

export const analyticsChannelSelect: INodeProperties = {
	displayName: 'Channel',
	name: 'channel',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description:
		'The connected social account to read metrics for. Only networks sona.to collects analytics for are listed.',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a channel...',
			typeOptions: {
				searchListMethod: 'getAnalyticsChannels',
				searchable: true,
			},
		},
		{
			displayName: 'By ID',
			name: 'id',
			type: 'string',
			placeholder: 'e.g. acc_example01',
		},
	],
};

export const seoProjectSelect: INodeProperties = {
	displayName: 'Project',
	name: 'project',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	description: 'The SEO project to act on',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a project...',
			typeOptions: {
				searchListMethod: 'getSeoProjects',
				searchable: false,
			},
		},
		{
			displayName: 'By ID',
			name: 'id',
			type: 'string',
			placeholder: 'e.g. seo_example01',
		},
	],
};
