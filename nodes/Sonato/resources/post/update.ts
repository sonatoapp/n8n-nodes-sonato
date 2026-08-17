import type { INodeProperties } from 'n8n-workflow';

const showOnlyForPostUpdate = {
	operation: ['update'],
	resource: ['post'],
};

export const postUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: showOnlyForPostUpdate },
		options: [
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'The text of the post',
				routing: {
					send: { type: 'body', property: 'caption' },
				},
			},
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
				description: 'When to publish',
				routing: {
					send: { type: 'body', property: 'scheduled_at' },
				},
			},
		],
	},
];
