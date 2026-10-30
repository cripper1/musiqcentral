import styles from "../dashboard/dashboard.module.css";
import { ArtistShell } from "./artist-shell";
import { ArtistSpaces } from "./artist-spaces";
export default function ArtistIndex() {
  return <ArtistShell>
    <section className={styles.hero}>
      <p>ARTIST WORKSPACE</p>
      <h1>Your Artist or Band Spaces</h1>
      <p>Manage each act in its own space, from your music and artist profile to fans, concerts, tickets, and merchandise as those capabilities become available.</p>
    </section>
    <ArtistSpaces />
  </ArtistShell>;
}
