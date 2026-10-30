import styles from "../../dashboard/dashboard.module.css";
import { ArtistShell } from "../artist-shell";
import { ArtistWorkspace } from "./workspace";

export default async function ArtistWorkspacePage({ params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  return <ArtistShell>
    <ArtistWorkspace channelId={channelId} />
  </ArtistShell>;
}
