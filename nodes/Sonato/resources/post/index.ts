import type { INodeProperties } from 'n8n-workflow';
import { postSelect } from '../../shared/descriptions';
import { postCreateDescription } from './create';
import { postGetDescription } from './get';
import { postGetManyDescription } from './getAll';
import { postUpdateDescription } from './update';

const showOnlyForPosts = {
	resource: ['post'],
};

export const postDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForPosts,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a post',
				description: 'Schedule or draft a new post',
				routing: {
					request: {
						method: 'POST',
						url: '/posts',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: { property: 'data' },
							},
						],
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Cancel a post',
				description: 'Cancel a scheduled post',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/posts/{{$parameter.post}}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: { property: 'data' },
							},
						],
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a post',
				description: 'Retrieve a single post',
				routing: {
					request: {
						method: 'GET',
						url: '=/posts/{{$parameter.post}}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: { property: 'data' },
							},
						],
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many posts',
				description: 'Retrieve a list of posts',
				routing: {
					request: {
						method: 'GET',
						url: '/posts',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: { property: 'data' },
							},
						],
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a post',
				description: 'Change an existing post',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/posts/{{$parameter.post}}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: { property: 'data' },
							},
						],
					},
				},
			},
		],
		default: 'getAll',
	},
	{
		...postSelect,
		displayOptions: {
			show: {
				...showOnlyForPosts,
				operation: ['get', 'update', 'delete'],
			},
		},
	},
	...postCreateDescription,
	...postGetDescription,
	...postGetManyDescription,
	...postUpdateDescription,
];
