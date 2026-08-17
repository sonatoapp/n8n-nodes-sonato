import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { accountDescription } from './resources/account';
import { analyticsDescription } from './resources/analytics';
import { channelDescription } from './resources/channel';
import { fileDescription } from './resources/file';
import { postDescription } from './resources/post';
import { seoIssueDescription } from './resources/seoIssue';
import { seoProjectDescription } from './resources/seoProject';
import { getAnalyticsChannels } from './listSearch/getAnalyticsChannels';
import { getChannels } from './listSearch/getChannels';
import { getPosts } from './listSearch/getPosts';
import { getSeoProjects } from './listSearch/getSeoProjects';
import { getChannelOptions } from './loadOptions/getChannelOptions';

export class Sonato implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'sona.to',
		name: 'sonato',
		icon: { light: 'file:../../icons/sonato.dark.svg', dark: 'file:../../icons/sonato.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Schedule posts across your social channels, crawl your sites for SEO issues and draft the fixes',
		defaults: {
			name: 'sona.to',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'sonatoApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.sona.to/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Analytics', value: 'analytics' },
					{ name: 'Channel', value: 'channel' },
					{ name: 'File', value: 'file' },
					{ name: 'Post', value: 'post' },
					{ name: 'SEO Issue', value: 'seoIssue' },
					{ name: 'SEO Project', value: 'seoProject' },
				],
				default: 'post',
			},
			...accountDescription,
			...analyticsDescription,
			...channelDescription,
			...fileDescription,
			...postDescription,
			...seoIssueDescription,
			...seoProjectDescription,
		],
	};

	methods = {
		listSearch: {
			getAnalyticsChannels,
			getChannels,
			getPosts,
			getSeoProjects,
		},
		loadOptions: {
			getChannelOptions,
		},
	};
}
