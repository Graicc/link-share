import CopyableLink from "~/app/_components/CopyableLink";
import { headers } from "next/headers";
import LinkList from "~/app/_components/LinkList";
import { api, HydrateClient } from "~/trpc/server";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const origin = (await headers()).get("host");

  const { username } = await params;
  void api.link.getUserLinks.prefetch({ username });

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#151e2c] text-white">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
          <h1 className="text-center text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-[hsl(220,100%,70%)]">{username}&apos;s</span>{" "}
            Shared Links
          </h1>
          <div className="flex flex-col items-center gap-4">
            <CopyableLink url={`https://${origin}/feed/${username}`} />
            <LinkList username={username} editable={false} />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
