import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  const rssFeed = await api.link.getRSSFeed({ username });

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/rss+xml",
    },
  });
}
