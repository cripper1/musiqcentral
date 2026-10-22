import Image from "next/image";
import styles from "./page.module.css";

const experiences = [
  { title: "Listen", icon: "♫", tag: "01 / EXPERIENCE", image: "listen", description: "Discover emerging voices, fresh releases and the artists shaping what's next." },
  { title: "Watch", icon: "▶", tag: "02 / EXPERIENCE", image: "watch", description: "Music videos, performances, behind-the-scenes stories and exclusive content." },
  { title: "Experience", icon: "✧", tag: "03 / EXPERIENCE", image: "experience", description: "Live events, shared moments and closer connections to the music." },
  { title: "Rewards", icon: "☆", tag: "04 / EXPERIENCE", image: "rewards", description: "A new vision for recognizing meaningful participation in the MusIQ ecosystem." },
];

const features = [
  { icon: "♬", title: "Artist Channels", description: "A connected home for music, video, events, updates and audiences." },
  { icon: "◉", title: "Fan Experience", description: "Discover artists, follow their journeys and engage with their communities." },
  { icon: "▱", title: "Commerce & Tickets", description: "Explore merchandise, music purchases and live experiences." },
  { icon: "☷", title: "Community", description: "Bring fans and creators together beyond the listening experience." },
  { icon: "✦", title: "MusIQ Rewards", description: "Designed for future participation and recognition opportunities." },
  { icon: "⬡", title: "Creator Tools", description: "A foundation for new possibilities across the music economy." },
];

const journey = [
  { icon: "♫", title: "Artist Content", detail: "Music, video & experiences" },
  { icon: "♧", title: "Fan Engagement", detail: "Listen, watch & connect" },
  { icon: "▱", title: "Commerce", detail: "Support artists directly" },
  { icon: "✦", title: "Rewards", detail: "Recognize participation" },
  { icon: "⬡", title: "Opportunity", detail: "More ways to grow" },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#home" className={compact ? styles.brandSmall : styles.brand} aria-label="MusIQ Central home">
      <Image src="/musiq-central-logo.png" alt="MusIQ Central" width={1448} height={1086} priority={!compact} unoptimized />
    </a>
  );
}

function Heading({ eyebrow, title, accent, detail }: { eyebrow: string; title: string; accent?: string; detail?: string }) {
  return <div className={styles.heading}>
    <div><p className={styles.eyebrow}>{eyebrow}</p><h2>{title} {accent && <em>{accent}</em>}</h2></div>
    {detail && <p className={styles.headingDetail}>{detail}</p>}
  </div>;
}

export default function Home() {
  return <div className={styles.site} id="home">
    <header className={styles.header}>
      <div className={styles.navInner}>
        <Brand compact />
        <nav aria-label="Primary navigation">
          <a className={styles.active} href="#home">Home</a>
          <a href="#platform">Platform</a>
          <a href="#features">Features</a>
          <a href="#artists">Artists</a>
          <a href="#fans">Fans</a>
          <a href="#rewards">Rewards</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="/register">Join / Sign in</a>
        </nav>
      </div>
    </header>
    <main>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroLight} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>ONE PLATFORM. A WORLD OF MUSIQ.</p>
          <div className={styles.heroLogo}><Image src="/musiq-central-logo.png" alt="MusIQ Central" width={1448} height={1086} priority unoptimized /></div>
          <h1 id="hero-title" className={styles.heroTagline}>Same Music. <span>New System.</span></h1>
          <p className={styles.heroSubhead}>The Smarter Way to <strong>Listen, Watch &amp; Experience</strong> Music and More.</p>
          <p className={styles.heroDescription}>MusIQ Central™ brings artists, fans, music, video, live experiences and community together in one connected destination.</p>
          <div className={styles.buttons}>
            <a className={styles.buttonPrimary} href="#platform">Explore the Platform <span aria-hidden="true">→</span></a>
            <a className={styles.buttonOutline} href="/register">Join MusIQ Central <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <section id="platform" className={styles.section}>
        <div className={styles.container}>
          <Heading eyebrow="ONE PLATFORM" title="Multiple" accent="Experiences." detail="Everything connects: the music, the creators and the people who make it matter." />
          <div className={styles.experienceGrid}>
            {experiences.map((item) => <article key={item.title} id={item.title === "Rewards" ? "rewards" : undefined} className={`${styles.experienceCard} ${styles[item.image]}`}>
              <span className={styles.experienceIcon} aria-hidden="true">{item.icon}</span>
              <div className={styles.cardText}><small>{item.tag}</small><h3>{item.title}</h3><p>{item.description}</p></div>
              <span className={styles.cardArrow} aria-hidden="true">↗</span>
            </article>)}
          </div>
        </div>
      </section>

      <section id="features" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <Heading eyebrow="PLATFORM FEATURES" title="What MusIQ Central" accent="Brings Together." detail="An artist-first platform designed to connect content, audiences and new opportunities." />
          <div className={styles.featureGrid}>
            {features.map((item) => <article key={item.title} className={styles.featureCard}>
              <span className={styles.featureIcon} aria-hidden="true">{item.icon}</span>
              <div><h3>{item.title}</h3><p>{item.description}</p></div>
            </article>)}
          </div>
        </div>
      </section>

      <section id="journey" className={styles.section}>
        <div className={styles.container}>
          <Heading eyebrow="THE MUSIQ CENTRAL FLOW" title="From Content to Community to" accent="Opportunity." detail="One connected journey, from discovering an artist to supporting their work." />
          <div className={styles.journeyGrid}>
            {journey.map((step, i) => <div key={step.title} className={styles.journeyStep}>
              <div className={styles.journeyIcon}>{step.icon}</div>
              <h3>{step.title}</h3><p>{step.detail}</p>
              {i < journey.length - 1 && <span className={styles.journeyArrow} aria-hidden="true">→</span>}
            </div>)}
          </div>
        </div>
      </section>

      <section id="about" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <Heading eyebrow="BUILT FOR A BRIGHTER TOMORROW" title="For Artists, Fans and" accent="Industry Growth." detail="The vision is bigger than streaming: better relationships, new experiences and a more connected music world." />
          <div className={styles.audienceGrid}>
            <article id="artists"><span aria-hidden="true">♬</span><div><h3>For Artists</h3><p>More ways to share your work, grow your audience and build lasting fan connections.</p></div></article>
            <article id="fans"><span aria-hidden="true">♧</span><div><h3>For Fans</h3><p>Discover, listen, watch and connect more closely with the music you love.</p></div></article>
            <article><span aria-hidden="true">▥</span><div><h3>For the Industry</h3><p>A flexible platform designed to connect opportunities across the music ecosystem.</p></div></article>
          </div>
        </div>
      </section>

      <section id="contact" className={styles.finalBanner}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>THE FUTURE OF MUSIC STARTS HERE</p>
          <h2>Bring the <em>MusIQ Central™</em> Experience to Life.</h2>
          <p>Explore the vision for a more connected world of music.</p>
          <a className={styles.buttonPrimary} href="#home">Back to the Top <span aria-hidden="true">↑</span></a>
        </div>
      </section>
    </main>
    <footer className={styles.footer}>
      <div className={styles.container}><Brand compact /><p>More Music. More People. A Brighter Tomorrow.</p><p>© 2026 MusIQ Central™. All rights reserved.</p></div>
    </footer>
  </div>;
}
