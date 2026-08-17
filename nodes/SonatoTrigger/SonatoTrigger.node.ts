import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { sonatoApiRequest } from '../Sonato/shared/transport';

type WebhookRecord = {
	id: string;
	url: string;
	events: string[];
	/** Returned once, at creation. It cannot be read back later. */
	secret?: string;
};

/** Deliveries are signed `t=<unix seconds>,v1=<hex hmac sha256>`. */
const SIGNATURE_TOLERANCE_SECONDS = 300;

function parseSignatureHeader(header: string): { timestamp: string; signature: string } | null {
	let timestamp = '';
	let signature = '';

	for (const part of header.split(',')) {
		const [key, value] = part.split('=', 2);
		if (key?.trim() === 't') {
			timestamp = value?.trim() ?? '';
		} else if (key?.trim() === 'v1') {
			signature = value?.trim() ?? '';
		}
	}

	return timestamp && signature ? { timestamp, signature } : null;
}

// The n8n lint rule wants usableAsTool on every node, while
// @n8n/scan-community-package rejects it on triggers, since a trigger cannot be
// invoked as an AI tool. The scanner is what verification runs, so it wins.
// eslint-disable-next-line @n8n/community-nodes/node-usable-as-tool
export class SonatoTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'sona.to Trigger',
		name: 'sonatoTrigger',
		icon: { light: 'file:../../icons/sonato.dark.svg', dark: 'file:../../icons/sonato.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Schedule posts across your social channels, crawl your sites for SEO issues and draft the fixes',
		defaults: {
			name: 'sona.to Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'sonatoApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				description: 'The events that start this workflow',
				options: [
					{
						name: 'Post Failed',
						value: 'post.failed',
						description: 'A post failed to publish',
					},
					{
						name: 'Post Published',
						value: 'post.published',
						description: 'A post was published successfully',
					},
					{
						name: 'SEO Audit Completed',
						value: 'seo.audit.completed',
						description: 'A site audit finished',
					},
					{
						name: 'SEO Audit Failed',
						value: 'seo.audit.failed',
						description: 'A site audit failed to complete',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (!webhookData.webhookId) {
					return false;
				}

				try {
					await sonatoApiRequest.call(
						this,
						'GET',
						`/webhooks/${webhookData.webhookId as string}`,
					);
					return true;
				} catch {
					delete webhookData.webhookId;
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const events = this.getNodeParameter('events') as string[];
				const webhookData = this.getWorkflowStaticData('node');

				const response = (await sonatoApiRequest.call(this, 'POST', '/webhooks', {}, {
					url: webhookUrl,
					events,
					description: 'n8n',
				})) as { data: WebhookRecord };

				if (!response?.data?.id) {
					return false;
				}

				webhookData.webhookId = response.data.id;

				// The signing secret is returned only on this response. Storing it here
				// is what makes delivery verification possible at all.
				if (response.data.secret) {
					webhookData.webhookSecret = response.data.secret;
				}

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (!webhookData.webhookId) {
					return true;
				}

				try {
					await sonatoApiRequest.call(
						this,
						'DELETE',
						`/webhooks/${webhookData.webhookId as string}`,
					);
				} catch (error) {
					// Surfaced rather than swallowed: a failed delete leaves an orphaned
					// endpoint on the account, counting against the per-team limit.
					this.logger.error('sona.to: could not delete webhook', {
						webhookId: webhookData.webhookId,
						error,
					});
					return false;
				}

				delete webhookData.webhookId;
				delete webhookData.webhookSecret;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const webhookData = this.getWorkflowStaticData('node');
		const secret = webhookData.webhookSecret as string | undefined;

		// Only verify when a secret was captured at registration. An endpoint
		// registered outside this node has no secret here, and rejecting those
		// would break a setup that is otherwise working.
		if (secret) {
			const headers = this.getHeaderData() as Record<string, string | undefined>;
			const header = headers['sona-signature'];

			if (!header) {
				throw new NodeOperationError(this.getNode(), 'Delivery had no signature header');
			}

			const parsed = parseSignatureHeader(header);

			if (!parsed) {
				throw new NodeOperationError(this.getNode(), 'Delivery signature was malformed');
			}

			// Bounded so a captured delivery cannot be replayed indefinitely.
			const age = Math.abs(Math.floor(Date.now() / 1000) - Number(parsed.timestamp));

			if (!Number.isFinite(age) || age > SIGNATURE_TOLERANCE_SECONDS) {
				throw new NodeOperationError(this.getNode(), 'Delivery timestamp was outside the accepted window');
			}

			// The exact bytes that were signed. Re-serialising the parsed body would
			// not reproduce them, so the raw buffer is the only workable input.
			const raw = this.getRequestObject().rawBody;

			if (!raw) {
				throw new NodeOperationError(this.getNode(), 'Raw request body was not available to verify the signature');
			}

			const expected = createHmac('sha256', secret)
				.update(`${parsed.timestamp}.${raw.toString('utf8')}`)
				.digest('hex');

			const a = Buffer.from(expected, 'utf8');
			const b = Buffer.from(parsed.signature, 'utf8');

			if (a.length !== b.length || !timingSafeEqual(a, b)) {
				throw new NodeOperationError(this.getNode(), 'Delivery signature did not match');
			}
		}

		const body = this.getBodyData() as IDataObject;

		// The envelope carries id, event and created_at, with the record itself
		// under data, wrapped again in post or project depending on the event.
		// Flatten both levels so downstream nodes reach the fields directly.
		const data = (body.data ?? {}) as IDataObject;
		const record = (data.post ?? data.project ?? data) as IDataObject;

		const output: IDataObject = {
			...record,
			event: body.event,
			event_id: body.id,
			event_created_at: body.created_at,
		};

		return {
			workflowData: [this.helpers.returnJsonArray([output])],
		};
	}
}
