import type { INodeProperties } from 'n8n-workflow';

const showOnlyForPostCreate = {
	operation: ['create'],
	resource: ['post'],
};

export const postCreateDescription: INodeProperties[] = [
	{
		displayName: 'Channel Names or IDs',
		name: 'accounts',
		type: 'multiOptions',
		default: [],
		required: true,
		displayOptions: { show: showOnlyForPostCreate },
		typeOptions: {
			loadOptionsMethod: 'getChannelOptions',
		},
		description:
			'The channels to publish to. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		routing: {
			send: {
				type: 'body',
				property: 'accounts',
			},
		},
	},
	{
		displayName: 'Caption',
		name: 'caption',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		displayOptions: { show: showOnlyForPostCreate },
		description: 'The text of the post',
		routing: {
			send: {
				type: 'body',
				property: 'caption',
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: showOnlyForPostCreate },
		options: [
			{
				displayName: 'Link',
				name: 'link',
				type: 'string',
				default: '',
				description: 'A URL to attach to the post',
				routing: {
					send: { type: 'body', property: 'link' },
				},
			},
			{
				displayName: 'Media URLs',
				name: 'media',
				type: 'string',
				default: '',
				description: 'Comma-separated list of publicly reachable image or video URLs',
				routing: {
					send: {
						type: 'body',
						property: 'media',
						value: '={{ $value.split(",").map((url) => url.trim()).filter((url) => url) }}',
					},
				},
			},
			{
				displayName: 'Scheduled At',
				name: 'scheduled_at',
				type: 'dateTime',
				default: '',
				description: 'When to publish. Leave empty to publish now.',
				routing: {
					send: { type: 'body', property: 'scheduled_at' },
				},
			},
		],
	},
];
