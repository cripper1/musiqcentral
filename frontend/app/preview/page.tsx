import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const experiences = [
  { number: "01", name: "Listen", description: "Discover music, follow the artists you love, and find your next favorite sound.", symbol: "♫" },
  { number: "02", name: "Watch", description: "Explore music videos, exclusive content, and the moments behind the music.", symbol: "▶" },
  { number: "03", name: "Experience", description: "Connect with performances, artist events, and shared fan experiences.", symbol: "✦" },
  { number: "04", name: "Participate", description: "Be part of the community through meaningful engagement and rewards.", symbol: "◎" },
];

const capabilities = [
  { symbol: "◉", title: "Artist Channels", copy: "One home for an artist's music, videos, updates, events, and fan community." },
  { symbol: "♫", title: "Music & Discovery", copy: "Explore releases and connect listeners with artists and new experiences." },
  { symbol: "◇", title: "Commerce & Tickets", copy: "Bring music purchases, merchandise, and ticketing together." },
  { symbol: "✳", title: "Community", copy: "Create closer connections between artists, their fans, and collaborators." },
  { symbol: "✦", title: "Rewards", copy: "Recognize qualifying participation through the MusIQ ecosystem." },
  { symbol: "⬡", title: "Connected Infrastructure", copy: "Integrate participating applications with validated network capabilities." },
];

export default function PreviewPage() {
  return (
    <div className={styles.page}>
      <header>
        <Link href="/preview" aria-label="MusIQ Central preview home">
          <span>Mus<span>IQ</span></span>
          <small>CENTRAL</small>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#platform">Platform</a>
          <a href="#experiences">Experiences</a>
          <a href="#artists">Artists & Fans</a>
          <a href="#connect">Connect</a>
        </nav>
        <a href="#connect">Discover MusIQ <span aria-hidden="true">↗</span></a>
      </header>

      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="hero-title">
          <p>ONE PLATFORM. A WORLD OF MUSIQ.</p>
          <Image
            className={styles.logo}
            src="/musiq-central-logo.png"
            alt="MusIQ Central blue and silver logo with musical soundwave"
            width={1448}
            height={1086}
            priority
          />
          <h1 id="hero-title">The Smarter Way to <em>Listen, Watch & Experience</em> Music and More.</h1>
          <p>Music. Artists. Fans. Events. Community. One connected destination built around the people who make music matter.</p>
          <div className={styles.ctas}>
            <a className={styles.primary} href="#experiences">Explore the experience <span aria-hidden="true">→</span></a>
            <a className={styles.secondary} href="#platform">Discover the platform <span aria-hidden="true">↗</span></a>
          </div>
          <div aria-hidden="true">SOUND <span>──── ◆ ────</span> CONNECTION <span>──── ◆ ────</span> EXPERIENCE</div>
        </section>

        <section id="experiences" aria-labelledby="experiences-title">
          <div>
            <p>ONE PLATFORM · MULTIPLE EXPERIENCES</p>
            <h2 id="experiences-title">Your music world, <em>reimagined.</em></h2>
            <p>Not another place to simply press play. A connected experience for discovering, watching, supporting, and celebrating the music you love.</p>
          </div>
          <div>
            {experiences.map((item) => (
              <article key={item.number}>
                <div aria-hidden="true">{item.symbol}</div>
                <small>{item.number} / EXPERIENCE</small>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="platform" aria-labelledby="platform-title">
          <div>
            <p>BUILT AROUND THE MUSIC</p>
            <h2 id="platform-title">More than streaming. <em>More connected.</em></h2>
            <p>MusIQ Central brings the artist and fan journey into focus through a unified platform experience.</p>
          </div>
          <div>
            {capabilities.map((item) => (
              <article key={item.title}>
                <div aria-hidden="true">{item.symbol}</div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="artists" aria-labelledby="artists-title">
          <p>THE FUTURE OF MUSIQ IS CONNECTED</p>
          <h2 id="artists-title">Made for the artists. <em>Made for the fans.</em></h2>
          <div>
            <article>
              <small>FOR ARTISTS</small>
              <h3>Create your world.</h3>
              <p>Bring your music, identity, content, and audience together in a place designed to support your creative journey.</p>
            </article>
            <article>
              <small>FOR FANS</small>
              <h3>Get closer to the music.</h3>
              <p>Discover new artists, follow your favorites, take part in experiences, and connect with the communities around them.</p>
            </article>
          </div>
        </section>

        <section id="connect" aria-labelledby="connect-title">
          <p>THE NEXT CHAPTER OF MUSIC STARTS HERE</p>
          <h2 id="connect-title">More music. More connection. <em>More possibility.</em></h2>
          <p>MusIQ Central is taking shape. Explore the vision and be part of what comes next.</p>
          <div className={styles.ctas}>
            <a className={styles.primary} href="mailto:info@musiqcentral.com?subject=MusIQ%20Central%20Interest">Get in touch <span aria-hidden="true">↗</span></a>
          </div>
        </section>
      </main>

      <footer>
        <Link href="/preview" aria-label="MusIQ Central home">Mus<span>IQ</span> <small>CENTRAL</small></Link>
        <p>The Smarter Way to Listen, Watch & Experience Music and More.</p>
        <p>© {new Date().getFullYear()} MusIQ Central. All rights reserved.</p>
      </footer>
    </div>
  );
}
