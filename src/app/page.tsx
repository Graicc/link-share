import Link from "next/link";
import { HydrateClient } from "~/trpc/server";
import { auth } from "~/server/auth";
import { AddLinkComponent } from "~/app/_components/AddLinkComponent";
import { LinkList } from "~/app/_components/LinkList";
import CopyableLink from "./_components/CopyableLink";
import { headers } from "next/headers";
import { signOut } from "next-auth/react";

export default async function Home() {
  const session = await auth();

  const origin = (await headers()).get("host");

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#151e2c] text-white">
        {/* <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#02366d] to-[#151e2c] text-white"> */}
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Link <span className="text-[hsl(220,100%,70%)]">Share</span>
          </h1>
          {session ? (
            <div className="flex flex-col items-center gap-4">
              <CopyableLink url={`${origin}/feed/${session?.user.name}`} />
              <AddLinkComponent />
              <LinkList />
              <Link
                href="/api/auth/signout"
                className="rounded-xl bg-white/10 px-5 py-2 font-semibold no-underline transition hover:bg-white/20"
              >
                Sign out
              </Link>
            </div>
          ) : (
            <Link
              href="/api/auth/signin"
              className="rounded-xl bg-white/10 px-5 py-2 font-semibold no-underline transition hover:bg-white/20"
            >
              Sign in
            </Link>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
