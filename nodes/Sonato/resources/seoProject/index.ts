import type { INodeProperties } from 'n8n-workflow';
import { seoProjectSelect } from '../../shared/descriptions';

const showOnlyForSeoProject = {
	resource: ['seoProject'],
};

export const seoProjectDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForSeoProject },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create an SEO project',
				description: 'Start auditing a new site',
				routing: {
					request: { method: 'POST', url: '/seo/projects' },
					output: {
						postReceive: [
							{ type: 'rootProperty', properties: { property: 'data' } },
						],
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get an SEO project',
				description: 'Retrieve a single project',
				routing: {
					request: {
						method: 'GET',
						url: '=/seo/projects/{{$parameter.project}}',
					},
					output: {
						postReceive: [
							{ type: 'rootProperty', properties: { property: 'data' } },
						],
					},
				},
			},
			{
				name: 'Get Issues',
				value: 'getIssues',
				action: 'Get issues for an SEO project',
				description: 'Retrieve the issues found by the last audit',
				routing: {
					request: {
						method: 'GET',
						url: '=/seo/projects/{{$parameter.project}}/issues',
					},
					output: {
						postReceive: [
							{ type: 'rootProperty', properties: { property: 'data' } },
						],
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many SEO projects',
				description: 'Retrieve the sites you are auditing',
				routing: {
					request: { method: 'GET', url: '/seo/projects' },
					output: {
						postReceive: [
							{ type: 'rootProperty', properties: { property: 'data' } },
						],
					},
				},
			},
			{
				name: 'Get Pages',
				value: 'getPages',
				action: 'Get pages for an SEO project',
				description: 'Retrieve the crawled pages',
				routing: {
					request: {
						method: 'GET',
						url: '=/seo/projects/{{$parameter.project}}/pages',
					},
					output: {
						postReceive: [
							{ type: 'rootProperty', properties: { property: 'data' } },
						],
					},
				},
			},
			{
				name: 'Run Audit',
				value: 'runAudit',
				action: 'Run an audit on an SEO project',
				description: 'Start a crawl of the site',
				routing: {
					request: {
						method: 'POST',
						url: '=/seo/projects/{{$parameter.project}}/audit',
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
		...seoProjectSelect,
		displayOptions: {
			show: {
				...showOnlyForSeoProject,
				operation: ['get', 'getIssues', 'getPages', 'runAudit'],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: { ...showOnlyForSeoProject, operation: ['getAll'] } },
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
			show: { ...showOnlyForSeoProject, operation: ['getAll'], returnAll: [false] },
		},
		description: 'Max number of results to return',
		routing: { send: { type: 'query', property: 'limit' } },
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. example.com',
		displayOptions: {
			show: { ...showOnlyForSeoProject, operation: ['create'] },
		},
		description: 'The site to audit',
		routing: { send: { type: 'body', property: 'domain' } },
	},
];
