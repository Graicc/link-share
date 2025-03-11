"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export const AddLinkComponent = () => {
  const [url, setUrl] = useState("");
  const addLink = api.link.add.useMutation({
    onError: (error) => {
      console.error("Error adding link:", error);
    },
  });
  const handleAddLink = async () => {
    if (url) {
      await addLink.mutateAsync({ url });
      await utils.link.getAll.invalidate();
    }
  };

  const utils = api.useUtils();

  return (
    <div className="flex flex-row items-center gap-2">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
        className="rounded-xl bg-white/10 px-4 py-2 text-white"
      />
      <button
        onClick={handleAddLink}
        className="rounded-xl bg-white/10 px-5 py-2 font-semibold no-underline transition hover:bg-white/20"
        disabled={addLink.isPending}
      >
        Add Link
      </button>
    </div>
  );
};
