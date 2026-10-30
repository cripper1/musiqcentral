"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ArtistShell } from "../artist-shell";
import { ArtistWorkspace } from "./workspace";

function ArtistWorkspaceContent() {
  const { channelId } = useParams<{ channelId: string }>();
  return <ArtistWorkspace channelId={channelId} />;
}

export default function ArtistWorkspacePage() {
  return <ArtistShell>
    <Suspense fallback={<p>Loading artist space…</p>}>
      <ArtistWorkspaceContent />
    </Suspense>
  </ArtistShell>;
}
