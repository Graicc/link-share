import { z } from "zod";
import fetch from "node-fetch";
import { load } from "cheerio";
import { createRSSFeed } from "~/server/utils/rss";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

async function extractMetadata(url: string): Promise<{
  title?: string;
  description?: string;
  image?: string;
  url: string;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "RSS Feed Generator Bot",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);

    const metadata: {
      title?: string;
      description?: string;
      image?: string;
      url: string;
    } = { url };

    const youtube = /(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/.exec(url);
    if (youtube && youtube.length > 0) {
      const videoUrl = `https://youtu.be/${youtube[1]}`;
      const newUrl = `https://youtube.com/oembed?url=${videoUrl}&format=json`;

      const response = await fetch(newUrl);

      type YouTubeData = {
        title: string;
        author_name: string;
        thumbnail_url: string;
      };
      const data = (await response.json()) as YouTubeData;

      metadata.title = data?.title;
      metadata.description = data?.author_name;
      metadata.image = data?.thumbnail_url;
      metadata.url = videoUrl;
      return metadata;
    }

    metadata.title =
      $('meta[property="og:title"]').attr("content") ??
      $('meta[name="twitter:title"]').attr("content") ??
      $("title").text() ??
      undefined;

    metadata.description =
      $('meta[property="og:description"]').attr("content") ??
      $('meta[name="twitter:description"]').attr("content") ??
      $('meta[name="description"]').attr("content") ??
      undefined;

    metadata.image =
      $('meta[property="og:image"]').attr("content") ??
      $('meta[name="twitter:image"]').attr("content") ??
      undefined;

    return metadata;
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return {};
  }
}

export const linkRouter = createTRPCRouter({
  add: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new Error("Not authenticated");
      }

      const embedData = await extractMetadata(input.url);

      return ctx.db.post.create({
        data: {
          name: embedData.title ?? "",
          url: embedData.url,
          title: embedData.title ?? "",
          description: embedData.description ?? "",
          image: embedData.image ?? undefined,
          createdById: ctx.session.user.id,
        },
      });
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) {
        throw new Error("Not authenticated");
      }
      return ctx.db.post.delete({
        where: {
          id: input.id,
        },
      });
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new Error("Not authenticated");
    }
    return ctx.db.post.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  getRSSFeed: publicProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          name: input.username,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const posts = await ctx.db.post.findMany({
        where: {
          createdById: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const formattedPosts = posts.map((post) => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
        image: post.image ?? undefined,
      }));
      return createRSSFeed(formattedPosts, input.username); // Update this line
    }),
});
