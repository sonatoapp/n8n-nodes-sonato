import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { sonatoApiRequest } from '../shared/transport';
import { channelLabel } from '../shared/networks';

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

export async function getChannels(
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

	const results: INodeListSearchItems[] = (response.data ?? []).map((item) => ({
		name: channelLabel(item),
		value: item.id,
	}));

	const total = response.meta?.total ?? results.length;
	const next = offset + limit < total ? String(offset + limit) : undefined;

	return { results, paginationToken: next };
}
