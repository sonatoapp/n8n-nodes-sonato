import type { INodeProperties } from 'n8n-workflow';
import { seoProjectSelect } from '../../shared/descriptions';

const showOnlyForSeoIssue = {
	resource: ['seoIssue'],
};

export const seoIssueDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForSeoIssue },
		options: [
			{
				name: 'Generate Fix',
				value: 'fix',
				action: 'Generate a fix for an SEO issue',
				description: 'Ask sona.to to produce a suggested fix',
				routing: {
					request: {
						method: 'POST',
						url: '=/seo/projects/{{$parameter.project}}/issues/{{$parameter.issueId}}/fix',
					},
					output: {
						postReceive: [
							{ type: 'rootProperty', properties: { property: 'data' } },
						],
					},
				},
			},
		],
		default: 'fix',
	},
	{
		...seoProjectSelect,
		displayOptions: { show: showOnlyForSeoIssue },
	},
	{
		displayName: 'Issue ID',
		name: 'issueId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 12345',
		displayOptions: { show: showOnlyForSeoIssue },
		description: 'The issue to fix, from Get Issues on an SEO project',
	},
];
