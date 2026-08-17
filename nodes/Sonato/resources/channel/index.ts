import type { INodeProperties } from 'n8n-workflow';

const showOnlyForChannels = {
	resource: ['channel'],
};

export const channelDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForChannels },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many channels',
				description: 'Retrieve the connected social accounts',
				routing: {
					request: {
						method: 'GET',
						url: '/accounts',
					},
					output: {
						postReceive: [
							{ type: 'rootProperty', properties: { property: 'data' } },
						],
					},
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: { ...showOnlyForChannels, operation: ['getAll'] } },
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: { paginate: '={{ $value }}' },
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
			show: { ...showOnlyForChannels, operation: ['getAll'], returnAll: [false] },
		},
		description: 'Max number of results to return',
		routing: { send: { type: 'query', property: 'limit' } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { ...showOnlyForChannels, operation: ['getAll'] } },
		options: [
			{
				displayName: 'Search',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Match text in the channel name or handle',
				routing: { send: { type: 'query', property: 'q' } },
			},
		],
	},
];
