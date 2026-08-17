import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SonatoApi implements ICredentialType {
	name = 'sonatoApi';

	displayName = 'sona.to API';

	icon: Icon = { light: 'file:../icons/sonato.dark.svg', dark: 'file:../icons/sonato.svg' };

	documentationUrl = 'https://developers.sona.to';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'An API token from your sona.to account. Write scope is required for create, update and delete operations.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.sona.to/v1',
			url: '/me',
			method: 'GET',
		},
	};
}
