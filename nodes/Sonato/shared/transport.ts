import type {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

export const SONATO_API_BASE = 'https://api.sona.to/v1';

export async function sonatoApiRequest(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	qs: IDataObject = {},
	body: IDataObject | undefined = undefined,
) {
	const options: IHttpRequestOptions = {
		method,
		qs,
		body,
		url: `${SONATO_API_BASE}${resource}`,
		json: true,
	};

	return await this.helpers.httpRequestWithAuthentication.call(this, 'sonatoApi', options);
}
