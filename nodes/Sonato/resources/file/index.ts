import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const showOnlyForFile = {
	resource: ['file'],
};

/**
 * Declarative routing sends JSON bodies, so multipart has to be assembled here.
 * FormData and Blob are globals on Node 18 and above, which keeps the package
 * free of runtime dependencies.
 */
async function buildMultipartBody(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const binaryProperty = this.getNodeParameter('binaryProperty') as string;
	const items = this.getInputData();
	const item = Array.isArray(items) ? items[0] : items;

	if (!item?.binary?.[binaryProperty]) {
		throw new NodeOperationError(
			this.getNode(),
			`No binary data found in property "${binaryProperty}"`,
		);
	}

	const binary = item.binary[binaryProperty];
	const buffer = await this.helpers.getBinaryDataBuffer(binaryProperty);

	const overrideName = this.getNodeParameter('options.fileName', '') as string;
	const fileName = overrideName || binary.fileName || 'upload';
	const mimeType = binary.mimeType || 'application/octet-stream';

	const form = new FormData();
	form.append('files[]', new Blob([buffer], { type: mimeType }), fileName);

	requestOptions.body = form;

	// Let the runtime set the multipart boundary. A Content-Type carried over
	// from requestDefaults would arrive without one and the upload would fail.
	const headers = (requestOptions.headers ?? {}) as IDataObject;
	delete headers['Content-Type'];
	delete headers['content-type'];
	requestOptions.headers = headers;

	return requestOptions;
}

export const fileDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForFile },
		options: [
			{
				name: 'Upload',
				value: 'upload',
				action: 'Upload a file',
				description: 'Upload an image or video and get a URL to use in a post',
				routing: {
					request: {
						method: 'POST',
						url: '/files',
					},
					send: {
						preSend: [buildMultipartBody],
					},
					output: {
						postReceive: [
							{ type: 'rootProperty', properties: { property: 'data' } },
						],
					},
				},
			},
		],
		default: 'upload',
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: { show: showOnlyForFile },
		hint: 'The name of the input binary field containing the file',
		description: 'The binary field holding the file to upload',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: showOnlyForFile },
		options: [
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				default: '',
				description: 'Override the file name. Leave empty to keep the original.',
			},
		],
	},
];
