"use client";

import { FaSpinner, FaTrash } from "react-icons/fa";
import { api } from "~/trpc/react";

export default function LinkList({
  username,
  editable,
}: {
  username: string;
  editable: boolean;
}) {
  const feedItems = api.link.getUserLinks.useQuery({ username });
  const remove = api.link.remove.useMutation();
  async function removeItem(index: number) {
    if (feedItems?.data?.[index]) {
      remove.mutate({ id: feedItems.data[index]?.id });
      await utils.link.getUserLinks.invalidate();
    }
  }

  const utils = api.useUtils();

  if (!feedItems.data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {feedItems.data.map((item, index) => (
        <div
          key={index}
          className="group relative flex w-full max-w-[400px] items-center gap-4 rounded-xl bg-gray-900 p-6"
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
          {editable && (
            <button
              onClick={() => removeItem(index)}
              className="margin-2 align-center absolute right-6 top-6 hidden rounded-xl bg-white p-2 text-center font-extrabold text-red-500 group-hover:block"
              disabled={remove.isPending}
            >
              {remove.isPending ? <FaSpinner /> : <FaTrash />}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
