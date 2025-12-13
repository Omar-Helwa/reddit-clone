// Seed data for communities and posts

export const communities = {
  hackthebox: {
    name: 'r/hackthebox',
    displayName: 'HackTheBox',
    description: 'Discussion about hackthebox.com machines, challenges, and cybersecurity learning!',
    icon: 'https://styles.redditmedia.com/t5_3kc4k/styles/communityIcon_awrm7y13mg851.jpg',
    banner: 'https://via.placeholder.com/1200x200/0045ac/ffffff?text=HackTheBox',
    members: '101K',
    online: '2.3K',
    createdDate: 'Created Jan 15, 2018',
    type: 'Public',
    rules: [
      'Be respectful and civil',
      'No spoilers in post titles',
      'No asking for solutions directly',
      'Search before posting',
      'Only HackTheBox related content'
    ],
    moderators: ['u/admin', 'u/moduser1', 'u/moduser2']
  },
  gaming: {
    name: 'r/gaming',
    displayName: 'Gaming',
    description: 'A subreddit for anything related to games.',
    icon: 'https://via.placeholder.com/120/ff4500/ffffff?text=G',
    banner: 'https://via.placeholder.com/1200x200/ff4500/ffffff?text=Gaming',
    members: '35M',
    online: '45K',
    createdDate: 'Created Sep 25, 2008',
    type: 'Public',
    rules: [
      'No bandwagon or direct reply posts',
      'No spoilers in titles',
      'No spam or personal blog content',
      'Be civil and respectful'
    ],
    moderators: ['u/gamemod', 'u/admin_gaming']
  },
  memes: {
    name: 'r/memes',
    displayName: 'Memes',
    description: 'Memes! Cultural information via humor.',
    icon: 'https://via.placeholder.com/120/46d160/ffffff?text=M',
    banner: 'https://via.placeholder.com/1200x200/46d160/ffffff?text=Memes',
    members: '28M',
    online: '32K',
    createdDate: 'Created Dec 1, 2008',
    type: 'Public',
    rules: [
      'All posts must be memes',
      'No spam or watermarks',
      'No hate speech',
      'No asking for upvotes'
    ],
    moderators: ['u/mememaster']
  },
  mynewcommunity: {
    name: 'r/mynewcommunity',
    displayName: 'My New Community',
    description: 'A fresh community ready to grow! Join us to discuss technology and innovation.',
    icon: 'https://via.placeholder.com/120/0079d3/ffffff?text=MNC',
    banner: 'https://via.placeholder.com/1200x200/0079d3/ffffff?text=My+New+Community',
    members: '1',
    online: '1',
    createdDate: 'Created Dec 12, 2024',
    type: 'Public',
    rules: [
      'Be respectful and kind',
      'Stay on topic',
      'No spam or self-promotion',
      'Follow Reddit content policy'
    ],
    moderators: ['u/creator']
  },
  general: {
    name: 'r/general',
    displayName: 'General',
    description: 'A general community for discussions about anything and everything!',
    icon: 'https://via.placeholder.com/120/7c4dff/ffffff?text=G',
    banner: 'https://via.placeholder.com/1200x200/7c4dff/ffffff?text=General',
    members: '500K',
    online: '5K',
    createdDate: 'Created Jan 1, 2015',
    type: 'Public',
    rules: [
      'Be respectful',
      'No spam',
      'Stay civil',
      'No personal attacks'
    ],
    moderators: ['u/generalmod']
  }
};

export const initialPosts = {
  hackthebox: [
    {
      id: '1',
      title: 'Just rooted my first HTB machine! Any tips for privilege escalation?',
      author: 'u/newbie_hacker',
      subreddit: 'hackthebox',
      type: 'text',
      score: 245,
      commentCount: 2,
      timestamp: '5 hours ago',
      textBody: 'Feeling awesome after getting root on my first box. Looking for resources to improve my privesc skills.',
      isPinned: false,
      comments: [
        { id: '1-1', author: 'u/mentor', score: 5, timestamp: '4 hours ago', text: 'Congrats! Check out GTFOBins and try SUID hunting.', replies: [] },
        { id: '1-2', author: 'u/enum_god', score: 3, timestamp: '3 hours ago', text: 'LinPEAS / WinPEAS are your best friends.', replies: [] }
      ]
    },
    {
      id: '2',
      title: 'Weekly Machine Discussion - "Forest"',
      author: 'u/htb_mod',
      subreddit: 'hackthebox',
      type: 'text',
      score: 189,
      commentCount: 1,
      timestamp: '1 day ago',
      textBody: '',
      isPinned: true,
      comments: [
        { id: '2-1', author: 'u/forest_runner', score: 2, timestamp: '20 hours ago', text: 'Loved the bloodhound pathing on this one.', replies: [] }
      ]
    },
    {
      id: '3',
      title: 'What is your enumeration checklist?',
      author: 'u/checklist_dev',
      subreddit: 'hackthebox',
      type: 'text',
      score: 112,
      commentCount: 0,
      timestamp: '10 hours ago',
      textBody: 'Share your go-to steps before digging deeper.',
      comments: []
    },
    {
      id: '4',
      title: 'Beginner friendly boxes in 2025?',
      author: 'u/new2025',
      subreddit: 'hackthebox',
      type: 'text',
      score: 76,
      commentCount: 0,
      timestamp: '2 hours ago',
      textBody: 'Looking for updated recommendations.',
      comments: []
    }
  ],
  gaming: [
    {
      id: '1',
      title: 'What game are you currently playing?',
      author: 'u/gamer123',
      subreddit: 'gaming',
      type: 'text',
      score: 1842,
      commentCount: 2,
      timestamp: '3 hours ago',
      textBody: 'Drop your current favorites!',
      comments: [
        { id: 'g1-1', author: 'u/rpg_fan', score: 12, timestamp: '2 hours ago', text: 'Baldur\'s Gate 3, again.', replies: [] },
        { id: 'g1-2', author: 'u/fps_main', score: 4, timestamp: '1 hour ago', text: 'MW 3 with friends.', replies: [] }
      ]
    },
    {
      id: '2',
      title: 'Just finished God of War Ragnarök - What a masterpiece!',
      author: 'u/playstation_fan',
      subreddit: 'gaming',
      type: 'text',
      score: 3421,
      commentCount: 1,
      timestamp: '8 hours ago',
      textBody: '',
      comments: [
        { id: 'g2-1', author: 'u/story_lover', score: 9, timestamp: '7 hours ago', text: 'Ending hit hard. Phenomenal OST.', replies: [] }
      ]
    },
    {
      id: '3',
      title: 'Co-op game recommendations for 2 players',
      author: 'u/coop_seeker',
      subreddit: 'gaming',
      type: 'text',
      score: 672,
      commentCount: 0,
      timestamp: '12 hours ago',
      textBody: 'PC or PS5. Thanks!',
      comments: []
    },
    {
      id: '4',
      title: 'Best indie game of 2025 so far?',
      author: 'u/indie_hunter',
      subreddit: 'gaming',
      type: 'text',
      score: 254,
      commentCount: 0,
      timestamp: '1 hour ago',
      textBody: 'Looking for hidden gems.',
      comments: []
    },
    {
      id: '5',
      title: 'Digital Foundry review worth watching?',
      author: 'u/link_dropper',
      subreddit: 'gaming',
      type: 'link',
      score: 88,
      commentCount: 0,
      timestamp: '30 mins ago',
      linkUrl: 'https://www.eurogamer.net/digitalfoundry',
      textBody: 'They have a new breakdown on performance.',
      comments: []
    }
  ],
  memes: [
    {
      id: '1',
      title: 'When you finally understand the meme',
      author: 'u/meme_lord_420',
      subreddit: 'memes',
      type: 'text',
      score: 8234,
      commentCount: 2,
      timestamp: '2 hours ago',
      textBody: '[Image]',
      comments: [
        { id: 'm1-1', author: 'u/lolcat', score: 14, timestamp: '1 hour ago', text: 'me_irl', replies: [] },
        { id: 'm1-2', author: 'u/pun_intended', score: 6, timestamp: '58 mins ago', text: 'Took me a sec 😂', replies: [] }
      ]
    },
    {
      id: '2',
      title: 'POV: You just got paid',
      author: 'u/broke_student',
      subreddit: 'memes',
      type: 'text',
      score: 5621,
      commentCount: 0,
      timestamp: '6 hours ago',
      textBody: '[Image]',
      comments: []
    },
    {
      id: '3',
      title: 'Programmers be like',
      author: 'u/coder_memes',
      subreddit: 'memes',
      type: 'text',
      score: 4532,
      commentCount: 0,
      timestamp: '10 hours ago',
      textBody: '[Image]',
      comments: []
    },
    {
      id: '4',
      title: 'When the Wi‑Fi drops for 2 seconds',
      author: 'u/buffer_boi',
      subreddit: 'memes',
      type: 'text',
      score: 1299,
      commentCount: 0,
      timestamp: '30 mins ago',
      textBody: '[Image]',
      comments: []
    },
    {
      id: '5',
      title: 'Cat tax',
      author: 'u/catlover',
      subreddit: 'memes',
      type: 'image',
      score: 512,
      commentCount: 0,
      timestamp: '15 mins ago',
      imageUrl: 'https://placekitten.com/800/450',
      textBody: 'Name: Mr. Whiskers.',
      comments: []
    }
  ],
  mynewcommunity: [
    {
      id: '1',
      title: 'Welcome to our new community! 🎉',
      author: 'u/creator',
      subreddit: 'mynewcommunity',
      type: 'text',
      score: 1,
      commentCount: 0,
      timestamp: '1 hour ago',
      textBody: 'Excited to build this community together!',
      isPinned: true,
      comments: []
    },
    {
      id: '2',
      title: 'Introduce yourself here',
      author: 'u/creator',
      subreddit: 'mynewcommunity',
      type: 'text',
      score: 0,
      commentCount: 0,
      timestamp: '50 mins ago',
      textBody: 'Tell us what you want to see!',
      comments: []
    }
  ],
  general: [
    {
      id: '1',
      title: "What's everyone up to this weekend?",
      author: 'u/casual_user',
      subreddit: 'general',
      type: 'text',
      score: 423,
      commentCount: 1,
      timestamp: '4 hours ago',
      textBody: 'Share your plans!',
      comments: [
        { id: 'gen1-1', author: 'u/weekend_warrior', score: 2, timestamp: '3 hours ago', text: 'Hiking if weather holds up.', replies: [] }
      ]
    },
    {
      id: '2',
      title: 'TIL: Bananas are berries but strawberries are not',
      author: 'u/science_nerd',
      subreddit: 'general',
      type: 'text',
      score: 892,
      commentCount: 0,
      timestamp: '9 hours ago',
      textBody: 'Taxonomy is wild.',
      comments: []
    },
    {
      id: '3',
      title: 'Best productivity tip that actually worked for you?',
      author: 'u/focus_mode',
      subreddit: 'general',
      type: 'text',
      score: 267,
      commentCount: 0,
      timestamp: '2 hours ago',
      textBody: 'Share real experiences only.',
      comments: []
    },
    {
      id: '4',
      title: 'Poll: Morning or Night person?',
      author: 'u/poller',
      subreddit: 'general',
      type: 'poll',
      score: 12,
      commentCount: 0,
      timestamp: '50 mins ago',
      pollOptions: [
        { id: 'p1', label: 'Morning', votes: 3 },
        { id: 'p2', label: 'Night', votes: 5 },
        { id: 'p3', label: 'Depends on coffee', votes: 2 }
      ],
      comments: []
    }
  ]
};

export const ensureSeeded = () => {
  try {
    const seeded = localStorage.getItem('seeded_v3');
    if (!seeded) {
      Object.entries(initialPosts).forEach(([key, posts]) => {
        const existingRaw = localStorage.getItem(`posts:${key}`);
        if (!existingRaw) {
          localStorage.setItem(`posts:${key}`, JSON.stringify(posts));
        } else {
          const existing = JSON.parse(existingRaw);
          const existingIds = new Set(existing.map(p => String(p.id)));
          const toAdd = posts.filter(p => !existingIds.has(String(p.id)));
          const merged = [...existing, ...toAdd];
          localStorage.setItem(`posts:${key}`, JSON.stringify(merged));
        }
      });
      localStorage.setItem('seeded_v3', 'true');
    }
  } catch (e) {
    // ignore storage errors
  }
};
