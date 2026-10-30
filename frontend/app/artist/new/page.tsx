import styles from "../../dashboard/dashboard.module.css";
import { ArtistShell } from "../artist-shell";
import { CreateArtistSpace } from "./create-artist-space";

export default function NewArtistSpacePage() {
  return <ArtistShell>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>ARTIST ONBOARDING</p>
      <h1>Create Your Artist or Band Space</h1>
      <p>Your home on MusIQ Central: where people will discover your music, and where you'll manage your recordings and artist activities.</p>
    </section>
    <CreateArtistSpace />
  </ArtistShell>;
}
