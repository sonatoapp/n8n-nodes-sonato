import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { sonatoApiRequest } from '../shared/transport';
import { channelLabel } from '../shared/networks';

type Channel = { id: string; name: string; username?: string; network?: string };

type ChannelResponse = {
	data: Channel[];
	meta?: { total: number; limit: number; offset: number };
};

/**
 * loadOptions has no pagination callback, so every page is fetched here.
 * 200 is the largest page the API serves, and the loop is bounded so a wrong
 * total cannot spin forever.
 */
export async function getChannelOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const limit = 200;
	const options: INodePropertyOptions[] = [];
	let offset = 0;

	for (let page = 0; page < 25; page++) {
		const response = (await sonatoApiRequest.call(this, 'GET', '/accounts', {
			limit,
			offset,
		})) as ChannelResponse;

		const batch = response.data ?? [];

		for (const item of batch) {
			options.push({ name: channelLabel(item), value: item.id });
		}

		const total = response.meta?.total ?? options.length;
		offset += limit;

		if (batch.length === 0 || offset >= total) {
			break;
		}
	}

	return options;
}
