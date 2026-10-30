import { Suspense } from "react";
import { ArtistShell } from "../artist-shell";
import { ArtistWorkspace } from "./workspace";

async function ArtistWorkspaceContent({ params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  return <ArtistWorkspace channelId={channelId} />;
}

export default function ArtistWorkspacePage({ params }: { params: Promise<{ channelId: string }> }) {
  return <ArtistShell>
    <Suspense fallback={<p>Loading artist space…</p>}>
      <ArtistWorkspaceContent params={params} />
    </Suspense>
  </ArtistShell>;
}
