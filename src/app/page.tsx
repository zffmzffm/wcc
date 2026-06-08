import Image from "next/image";

export default function Home() {
  return (
    <main className="maintenance-page" aria-labelledby="maintenance-title">
      <section className="maintenance-hero">
        <div className="maintenance-copy">
          <p className="maintenance-status">Temporary pause for a critical fix</p>
          <h1 id="maintenance-title">We found a bug. We are fixing it now.</h1>
          <p className="maintenance-lede">
            We are sorry for the interruption. Cup26Map is being taken offline briefly so we can correct the issue properly instead of leaving a broken experience live.
          </p>

          <p className="maintenance-return">
            Thank you for your patience. We will be back soon with the corrected version.
          </p>
        </div>

        <figure className="maintenance-visual">
          <Image
            src="/maintenance-player.png"
            alt="Sweating soccer ball character running"
            width={1024}
            height={1024}
            priority
          />
        </figure>
      </section>
    </main>
  );
}
