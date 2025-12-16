// Simple localStorage-backed helpers for joined communities

export const getJoinedCommunities = () => {
	try {
		const raw = localStorage.getItem('joinedCommunities');
		return raw ? JSON.parse(raw) : [];
	} catch (e) {
		return [];
	}
};

export const isJoined = (communityName) => {
	const list = getJoinedCommunities();
	return list.includes(communityName);
};

export const joinCommunity = (communityName) => {
	try {
		const list = getJoinedCommunities();
		if (!list.includes(communityName)) {
			const updated = [...list, communityName];
			localStorage.setItem('joinedCommunities', JSON.stringify(updated));
		}
	} catch (e) {}
};

export const leaveCommunity = (communityName) => {
	try {
		const list = getJoinedCommunities();
		const updated = list.filter((c) => c !== communityName);
		localStorage.setItem('joinedCommunities', JSON.stringify(updated));
	} catch (e) {}
};

export const navigate = (path) => {
	window.history.pushState({}, '', path);
	window.dispatchEvent(new PopStateEvent('popstate'));
};
