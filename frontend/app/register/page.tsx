import Image from "next/image";
import Link from "next/link";
import styles from "./register.module.css";

export default function RegisterPage() {
  const signInUrl = process.env.NEXT_PUBLIC_MUSIQ_SSO_URL;
  return <main className={styles.shell}>
    <div className={styles.panel}>
      <Link href="/" className={styles.logo}>
        <Image src="/musiq-central-logo.png" alt="MusIQ Central" width={210} height={158} unoptimized />
      </Link>
      <p className={styles.eyebrow}>WELCOME TO MUSIQ CENTRAL</p>
      <h1>Join MusIQ Central</h1>
      <p className={styles.intro}>One account to discover music, connect with artists, and explore the MusIQ Central experience.</p>
      {signInUrl
        ? <a className={styles.primary} href={signInUrl}>Continue with MusIQ Network <span aria-hidden="true">→</span></a>
        : <div className={styles.notice} role="status">Account registration is not available yet. We’re connecting secure sign-in before opening registration.</div>}
      <p className={styles.back}><Link href="/">← Back to MusIQ Central</Link></p>
    </div>
  </main>;
}
