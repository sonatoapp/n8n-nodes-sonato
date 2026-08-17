import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { sonatoApiRequest } from '../shared/transport';

type SonatoPost = {
	id: string;
	caption?: string | null;
	status?: string;
	scheduled_at?: string | null;
};

type PostResponse = {
	data: SonatoPost[];
	meta: { total: number; limit: number; offset: number };
};

export async function getPosts(
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

	const response = (await sonatoApiRequest.call(this, 'GET', '/posts', qs)) as PostResponse;

	const results: INodeListSearchItems[] = (response.data ?? []).map((item) => {
		const caption = (item.caption ?? '').replace(/\s+/g, ' ').trim();
		const label = caption.length > 60 ? `${caption.slice(0, 57)}...` : caption;
		return {
			name: label ? `${label} [${item.status ?? 'unknown'}]` : `${item.id} [${item.status ?? 'unknown'}]`,
			value: item.id,
		};
	});

	const total = response.meta?.total ?? results.length;
	const next = offset + limit < total ? String(offset + limit) : undefined;

	return { results, paginationToken: next };
}
