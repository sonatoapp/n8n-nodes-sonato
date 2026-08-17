import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { sonatoApiRequest } from '../shared/transport';
import { ANALYTICS_NETWORKS, channelLabel } from '../shared/networks';

type SonatoChannel = {
	id: string;
	name: string;
	username?: string;
	network?: string;
};

type ChannelResponse = {
	data: SonatoChannel[];
	meta: { total: number; limit: number; offset: number };
};

/**
 * Only channels on a network sona.to collects analytics for. The endpoint does
 * not reject the others, it just returns nothing, so offering them would be a
 * dead choice.
 */
export async function getAnalyticsChannels(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const offset = paginationToken ? Number(paginationToken) : 0;
	const limit = 100;

	const qs: Record<string, string | number> = { limit, offset };
	if (filter) {
		qs.q = filter;
	}

	const response = (await sonatoApiRequest.call(this, 'GET', '/accounts', qs)) as ChannelResponse;

	const results: INodeListSearchItems[] = (response.data ?? [])
		.filter((item) => item.network && ANALYTICS_NETWORKS.includes(item.network))
		.map((item) => ({
			name: channelLabel(item),
			value: item.id,
		}));

	// Paging is driven by the unfiltered total, so a page whose channels are all
	// unsupported still advances rather than ending the list early.
	const total = response.meta?.total ?? results.length;
	const next = offset + limit < total ? String(offset + limit) : undefined;

	return { results, paginationToken: next };
}
