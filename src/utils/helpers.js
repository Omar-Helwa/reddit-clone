// Simple localStorage-backed helpers for joined communities

export const getJoinedCommunities = () => {
	try {
		const raw = localStorage.getItem('joinedCommunities');
		const parsed = raw ? JSON.parse(raw) : [];
		const list = Array.isArray(parsed) ? parsed : [];
		return list
			.map((c) => (c == null ? '' : String(c)))
			.map((c) => c.replace(/^r\//, '').trim())
			.filter((c) => c && c !== 'undefined' && c !== 'null' && c !== 'general');
	} catch (e) {
		return [];
	}
};

export const isJoined = (communityName) => {
	const slug = (communityName == null ? '' : String(communityName)).replace(/^r\//, '').trim();
	if (!slug || slug === 'undefined' || slug === 'null' || slug === 'general') return false;
	const list = getJoinedCommunities();
	return list.includes(slug);
};

export const joinCommunity = (communityName) => {
	try {
		const slug = (communityName == null ? '' : String(communityName)).replace(/^r\//, '').trim();
		if (!slug || slug === 'undefined' || slug === 'null' || slug === 'general') return;
		const list = getJoinedCommunities();
		if (!list.includes(slug)) {
			const updated = [...list, slug];
			localStorage.setItem('joinedCommunities', JSON.stringify(updated));
			// Dispatch custom event to notify all components
			window.dispatchEvent(new CustomEvent('communityJoinChange', { detail: { community: slug, joined: true } }));
		}
	} catch (e) {}
};

export const leaveCommunity = (communityName) => {
	try {
		const slug = (communityName == null ? '' : String(communityName)).replace(/^r\//, '').trim();
		if (!slug || slug === 'undefined' || slug === 'null') return;
		const list = getJoinedCommunities();
		const updated = list.filter((c) => c !== slug);
		localStorage.setItem('joinedCommunities', JSON.stringify(updated));
		// Dispatch custom event to notify all components
		window.dispatchEvent(new CustomEvent('communityJoinChange', { detail: { community: slug, joined: false } }));
	} catch (e) {}
};

export const navigate = (path) => {
	window.history.pushState({}, '', path);
	window.dispatchEvent(new PopStateEvent('popstate'));
};
