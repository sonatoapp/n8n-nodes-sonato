import type { INodeProperties } from 'n8n-workflow';

const showOnlyForPostGetMany = {
	operation: ['getAll'],
	resource: ['post'],
};

export const postGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: showOnlyForPostGetMany },
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: {
				paginate: '={{ $value }}',
			},
			operations: {
				pagination: {
					type: 'offset',
					properties: {
						limitParameter: 'limit',
						offsetParameter: 'offset',
						pageSize: 100,
						type: 'query',
					},
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 200 },
		displayOptions: {
			show: { ...showOnlyForPostGetMany, returnAll: [false] },
		},
		description: 'Max number of results to return',
		routing: {
			send: { type: 'query', property: 'limit' },
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: showOnlyForPostGetMany },
		options: [
			{
				displayName: 'Channel Name or ID',
				name: 'account',
				type: 'options',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'getChannelOptions',
				},
				description:
					'Only posts for this channel. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				routing: {
					send: { type: 'query', property: 'account' },
				},
			},
			{
				displayName: 'Search',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Match text anywhere in the post caption',
				routing: {
					send: { type: 'query', property: 'q' },
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'scheduled',
				description: 'Filter by post state',
				options: [
					{ name: 'Awaiting Approval', value: 'awaiting_approval' },
					{ name: 'Draft', value: 'draft' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Processing', value: 'processing' },
					{ name: 'Published', value: 'published' },
					{ name: 'Scheduled', value: 'scheduled' },
				],
				routing: {
					send: { type: 'query', property: 'status' },
				},
			},
		],
	},
];
