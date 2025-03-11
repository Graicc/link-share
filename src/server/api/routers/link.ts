import { z } from "zod";
import fetch from "node-fetch";
import { load } from "cheerio"; // Add this import
import { createRSSFeed } from "~/server/utils/rss"; // Add this import

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

// Add this function to extract metadata
async function extractMetadata(
  url: string,
): Promise<{ title?: string; description?: string; image?: string }> {
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

    const metadata: { title?: string; description?: string; image?: string } =
      {};

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

      const embedData = await extractMetadata(input.url); // Add this line

      return ctx.db.post.create({
        data: {
          name: embedData.title ?? "", // Add this line
          url: input.url,
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
