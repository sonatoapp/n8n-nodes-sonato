import type { INodeProperties } from 'n8n-workflow';
import { analyticsChannelSelect } from '../../shared/descriptions';

const showOnlyForAnalytics = {
	resource: ['analytics'],
};

export const analyticsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForAnalytics },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get analytics for a channel',
				description: 'Retrieve metrics for one connected channel',
				routing: {
					request: {
						method: 'GET',
						url: '=/analytics/{{$parameter.channel}}',
					},
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
					},
				},
			},
		],
		default: 'get',
	},
	{
		...analyticsChannelSelect,
		displayOptions: { show: showOnlyForAnalytics },
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: showOnlyForAnalytics },
		options: [
			{
				displayName: 'Since',
				name: 'since',
				type: 'dateTime',
				default: '',
				description: 'Start date. Defaults to 30 days ago.',
				routing: { send: { type: 'query', property: 'since' } },
			},
			{
				displayName: 'Until',
				name: 'until',
				type: 'dateTime',
				default: '',
				description: 'End date. Defaults to today.',
				routing: { send: { type: 'query', property: 'until' } },
			},
		],
	},
];
