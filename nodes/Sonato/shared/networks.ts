/**
 * Display names for the network slugs stored on an account. Kept in step with
 * the Zapier integration so a channel reads the same in both tools.
 */
export const NETWORKS: Record<string, string> = {
	bluesky: 'Bluesky',
	facebook: 'Facebook',
	instagram: 'Instagram',
	line: 'LINE',
	linkedin: 'LinkedIn',
	mastodon: 'Mastodon',
	pinterest: 'Pinterest',
	reddit: 'Reddit',
	telegram: 'Telegram',
	threads: 'Threads',
	tiktok: 'TikTok',
	x: 'X',
	youtube: 'YouTube',
};

/**
 * Networks sona.to collects analytics for. A channel outside this list returns
 * an empty result rather than an error, so the analytics picker filters on it
 * instead of offering a dead choice.
 */
export const ANALYTICS_NETWORKS = [
	'facebook',
	'instagram',
	'line',
	'linkedin',
	'pinterest',
	'reddit',
	'telegram',
	'threads',
	'tiktok',
	'youtube',
];

/**
 * Some networks store the handle with a leading @ and some without, so it is
 * stripped before formatting to avoid rendering a double @.
 */
export function channelLabel(item: {
	name?: string;
	username?: string | null;
	network?: string | null;
	id: string;
}): string {
	const network = item.network ? NETWORKS[item.network] ?? item.network : '';
	const handle = (item.username ?? '').replace(/^@+/, '').trim();
	const base = item.name?.trim() || item.id;
	const withHandle = handle ? `${base} (@${handle})` : base;

	return network ? `${withHandle} - ${network}` : withHandle;
}
