// Mock chat data for development

export const mockChats = [
  {
    _id: 'chat1',
    user1: { id: '1', name: 'Current User', image: {} },
    user2: { id: '2', name: 'Jane Doe', image: {} },
    lastMessage: 'Hey, how are you?',
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    _id: 'chat2',
    user1: { id: '1', name: 'Current User', image: {} },
    user2: { id: '3', name: 'John Smith', image: {} },
    lastMessage: "Let's catch up tomorrow.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

export const mockMessages = {
  chat1: [
    {
      _id: 'm1',
      chatId: 'chat1',
      userId: '2',
      content: 'Hey!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      _id: 'm2',
      chatId: 'chat1',
      userId: '1',
      content: 'Hey, how are you?',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
      _id: 'm3',
      chatId: 'chat1',
      userId: '2',
      content: "I'm good, thanks!",
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
  ],
  chat2: [
    {
      _id: 'm4',
      chatId: 'chat2',
      userId: '1',
      content: 'Are you free tomorrow?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      _id: 'm5',
      chatId: 'chat2',
      userId: '3',
      content: 'Yes, afternoon works.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.5).toISOString(),
    },
  ],
};
