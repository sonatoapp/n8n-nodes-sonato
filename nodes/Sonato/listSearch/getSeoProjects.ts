import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { sonatoApiRequest } from '../shared/transport';

type SonatoSeoProject = {
	id: string;
	domain: string;
};

type SeoProjectResponse = {
	data: SonatoSeoProject[];
	meta?: { total: number; limit: number; offset: number };
};

export async function getSeoProjects(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const offset = paginationToken ? Number(paginationToken) : 0;
	const limit = 100;

	const response = (await sonatoApiRequest.call(this, 'GET', '/seo/projects', {
		limit,
		offset,
	})) as SeoProjectResponse;

	const results: INodeListSearchItems[] = (response.data ?? []).map((item) => ({
		name: item.domain,
		value: item.id,
	}));

	const total = response.meta?.total ?? results.length;
	const next = offset + limit < total ? String(offset + limit) : undefined;

	return { results, paginationToken: next };
}
