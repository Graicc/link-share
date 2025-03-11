"use client";

import { type Post } from "@prisma/client";
import { FaSpinner, FaTrash } from "react-icons/fa"; // Import the FontAwesome minus icon
import { api } from "~/trpc/react";

interface LinkListProps {
  feedItems: Post[];
}

export const LinkList = () => {
  const [feedItems, feedItemsQuery] = api.link.getAll.useSuspenseQuery();
  const remove = api.link.remove.useMutation();
  async function removeItem(index: number) {
    remove.mutate({ id: feedItems[index].id });
    await utils.link.getAll.invalidate();
  }

  const utils = api.useUtils();

  return (
    <div className="flex flex-col items-center gap-2">
      {feedItemsQuery.isSuccess &&
        feedItems.map((item, index) => (
          <div
            key={index}
            className="group relative flex w-[400px] items-center gap-4 rounded-xl bg-gray-900 p-6"
          >
            <div className="flex flex-col">
              <a href={item.url} target="_blank" className="text-lg">
                {item.title}
              </a>
              <a
                href={item.url}
                target="_blank"
                className="text-sm text-gray-400"
              >
                {item.url}
              </a>
              <p>{item.description}</p>
            </div>
            <button
              onClick={() => removeItem(index)}
              className="margin-2 align-center absolute right-6 top-6 hidden rounded-xl bg-white p-2 text-center font-extrabold text-red-500 group-hover:block"
              disabled={remove.isPending}
            >
              {remove.isPending ? <FaSpinner /> : <FaTrash />}
            </button>
          </div>
        ))}
    </div>
  );
};
