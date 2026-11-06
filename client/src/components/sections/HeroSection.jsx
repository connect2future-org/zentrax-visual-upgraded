import { useEffect, useRef, useState } from "react";
import logo from "../../assets/logo.png";

/* ──────────────────────────────────────────────────────
   Premium Indian construction / skyline images
   All free-to-use via Unsplash
────────────────────────────────────────────────────── */
const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&q=88&auto=format&fit=crop",
    pos: "center 40%",
    caption: "Modern Urban Development",
  },
  {
    url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=88&auto=format&fit=crop",
    pos: "center 35%",
    caption: "Premium High-Rise Construction",
  },
  {
    url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=88&auto=format&fit=crop",
    pos: "center 50%",
    caption: "Luxury Residential Projects",
  },
  {
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=88&auto=format&fit=crop",
    pos: "center 30%",
    caption: "Architectural Excellence",
  },
];

function HeroSection() {
  const [current, setCurrent]   = useState(0);
  const [fading,  setFading]    = useState(false);
  const timerRef                = useRef(null);

  /* Auto-advance slides every 6 s */
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % SLIDES.length);
        setFading(false);
      }, 900);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (idx) => {
    clearInterval(timerRef.current);
    setFading(true);
    setTimeout(() => { setCurrent(idx); setFading(false); }, 900);
  };

  return (
    <section id="hero">

      {/* ── Background slideshow ──────────────────────────── */}
      {SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className="hero-bg"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${slide.url})`,
            backgroundPosition: slide.pos,
            opacity: idx === current ? (fading ? 0 : 1) : 0,
            transition: "opacity 0.9s ease",
            position: "absolute",
            inset: "-6%",
            backgroundSize: "cover",
            animation: idx === current ? "heroZoom 18s ease-in-out infinite alternate" : "none",
            willChange: "transform",
            zIndex: 0,
          }}
        />
      ))}

      {/* ── Overlay ───────────────────────────────────────── */}
      <div className="hero-overlay" aria-hidden="true" />

      {/* ── Hero content (UNCHANGED) ──────────────────────── */}
      <div className="hero-content reveal">
        <div className="hero-brand-name hero-brand-main-row">
          <span className="hero-brand-main">ZENTRAX</span>
          <span className="hero-brand-sub">CONSTRUCTION</span>
        </div>
        <div className="hero-divider"></div>
        <h1 className="hero-title">One Stop Solution For All Construction And Manpower Related Work</h1>
        <p className="hero-desc">
          Providing skilled manpower, construction support, material assistance, planning services, and workforce solutions across multiple industries.
        </p>
        <div className="hero-btns">
          <a href="#contact" className="btn-gold">Hire Workers Now</a>
          <a href="https://web.whatsapp.com/send?phone=918911170406&text=Hello%2C%20I%20would%20like%20to%20enquire%20about%20Zentrax%20services." className="btn-gold" target="_blank" rel="noopener noreferrer">WhatsApp +91 8911170406</a>
        </div>
      </div>

      {/* ── Stats (UNCHANGED) ────────────────────────────── */}
      <div className="hero-stats">
        <div className="hstat">
          <span className="hstat-num" data-target="2018">0</span>
          <span className="hstat-label">Founded</span>
        </div>
        <div className="hstat-sep"></div>
        <div className="hstat">
          <span className="hstat-num" data-target="24">0</span>
          <span className="hstat-suffix">/7</span>
          <span className="hstat-label">Support</span>
        </div>
        <div className="hstat-sep"></div>
        <div className="hstat">
          <span className="hstat-num" data-target="100">0</span>
          <span className="hstat-suffix">%</span>
          <span className="hstat-label">Commitment</span>
        </div>
      </div>

      {/* ── Slide indicators ─────────────────────────────── */}
      <div
        aria-label="Slide indicators"
        style={{
          position: "absolute", bottom: "6.5rem", right: "2.5rem",
          display: "flex", gap: "8px", zIndex: 10,
        }}
      >
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Slide ${idx + 1}`}
            style={{
              width:  idx === current ? "28px" : "7px",
              height: "7px",
              borderRadius: idx === current ? "4px" : "50%",
              background: idx === current ? "var(--gold)" : "rgba(255,255,255,0.35)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.35s ease",
            }}
          />
        ))}
      </div>

      {/* ── Scroll indicator (UNCHANGED) ──────────────────── */}
      <a href="#philosophy" className="scroll-down">
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </a>
    </section>
  );
}

export default HeroSection;
