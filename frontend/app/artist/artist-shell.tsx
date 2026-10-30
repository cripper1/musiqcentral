import Link from "next/link";
import Image from "next/image";
import styles from "../dashboard/dashboard.module.css";
import { SignOut } from "../dashboard/sign-out";

export function ArtistShell({ children }: { children: React.ReactNode }) {
  return <main className={styles.shell}>
    <header className={styles.header}>
      <Link href="/" aria-label="MusIQ Central public home"><Image src="/musiq-central-logo.png" alt="MusIQ Central" width={138} height={104} unoptimized /></Link>
      <nav aria-label="Artist navigation"><Link href="/dashboard">Dashboard</Link><Link href="/artist">Artist Spaces</Link><Link href="/">Public home</Link><SignOut /></nav>
    </header>
    {children}
    <footer className={styles.footer}>MusIQ Central · Artist workspace</footer>
  </main>;
}
