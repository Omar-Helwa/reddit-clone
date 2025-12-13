// Simple localStorage-backed helpers for joined communities, posts, and comments

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

export const getPosts = (communityName) => {
	try {
		const raw = localStorage.getItem(`posts:${communityName}`);
		return raw ? JSON.parse(raw) : [];
	} catch (e) {
		return [];
	}
};

export const savePosts = (communityName, posts) => {
	try {
		localStorage.setItem(`posts:${communityName}`, JSON.stringify(posts));
	} catch (e) {}
};

export const addPost = (communityName, post) => {
	const posts = getPosts(communityName);
	const newId = String(posts.length > 0 ? Math.max(...posts.map(p => Number(p.id) || 0)) + 1 : 1);
	const newPost = {
		id: newId,
		score: 0,
		commentCount: 0,
		timestamp: 'just now',
		comments: [],
		subreddit: communityName,
		type: post.type || 'text',
		...post
	};
	const updated = [newPost, ...posts];
	savePosts(communityName, updated);
	return newPost;
};

export const getPostById = (communityName, postId) => {
	const posts = getPosts(communityName);
	return posts.find(p => String(p.id) === String(postId));
};

export const addComment = (communityName, postId, text, author = 'u/demo_user') => {
	const posts = getPosts(communityName);
	const idx = posts.findIndex(p => String(p.id) === String(postId));
	if (idx === -1) return null;
	const comment = {
		id: `${postId}-${Date.now()}`,
		author,
		score: 1,
		timestamp: 'just now',
		text,
		replies: []
	};
	posts[idx].comments = posts[idx].comments || [];
	posts[idx].comments.unshift(comment);
	posts[idx].commentCount = (posts[idx].commentCount || 0) + 1;
	savePosts(communityName, posts);
	return comment;
};

export const votePollOption = (communityName, postId, optionId) => {
	const posts = getPosts(communityName);
	const idx = posts.findIndex(p => String(p.id) === String(postId));
	if (idx === -1) return null;
	const post = posts[idx];
	if (!post.pollOptions) return null;
	const optIdx = post.pollOptions.findIndex(o => String(o.id) === String(optionId));
	if (optIdx === -1) return null;
	post.pollOptions[optIdx].votes = (post.pollOptions[optIdx].votes || 0) + 1;
	savePosts(communityName, posts);
	return post;
};

export const navigate = (path) => {
	window.history.pushState({}, '', path);
	window.dispatchEvent(new PopStateEvent('popstate'));
};
