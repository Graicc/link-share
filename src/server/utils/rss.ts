import { Feed } from "feed";

interface Post {
  title: string;
  url: string;
  description: string;
  createdAt: string;
  image?: string;
}

export function createRSSFeed(posts: Post[], username: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const feed: Feed = new Feed({
    title: `${username}'s Shared Links`,
    id: `https://share-links.graic.net/feed/${username}`,
    link: `https://share-links.graic.net/feed/${username}`,
    author: {
      name: username,
    },
    copyright: `All rights reserved ${new Date().getFullYear()}`,
  });

  posts.forEach((post) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    feed.addItem({
      title: post.title,
      id: post.url,
      link: post.url,
      description: post.description,
      content: post.description,
      author: [
        {
          name: username,
          // email: `${username}@example.com`,
          // link: `http://example.com/${username}`,
        },
      ],
      date: new Date(post.createdAt),
      image: post.image,
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return feed.rss2();
}
