"use client";

import { useState } from "react";
import { FaCheck, FaCopy } from "react-icons/fa";

export default function CopyableLink({ url }: { url: string }) {
  const [selected, setSelected] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
    setSelected(true);
    setTimeout(() => setSelected(false), 2000);
  };

  return (
    <button className="localhost:3000/feed/Graic" onClick={copyToClipboard}>
      <span className="text-gray-400 underline">{url}</span>{" "}
      {selected ? (
        <FaCheck className="inline" />
      ) : (
        <FaCopy className="inline" />
      )}
    </button>
  );
}
