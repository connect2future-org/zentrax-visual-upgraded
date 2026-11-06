import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../assets/logo.png";

const getScrollPosition = (target) => {
  const targetScrollTop = target instanceof HTMLElement ? target.scrollTop : 0;

  return Math.max(
    targetScrollTop,
    window.scrollY || 0,
    window.pageYOffset || 0,
    document.documentElement.scrollTop || 0,
    document.body.scrollTop || 0,
  );
};

function NavbarSection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoVisible, setIsLogoVisible] = useState(
    () => typeof window === "undefined" || window.scrollY <= 2,
  );

  useEffect(() => {
    const updateLogoVisibility = (event) => {
      setIsLogoVisible(getScrollPosition(event?.target) <= 2);
    };

    updateLogoVisibility();
    window.addEventListener("scroll", updateLogoVisibility, { passive: true });
    document.addEventListener("scroll", updateLogoVisibility, { capture: true, passive: true });

    return () => {
      window.removeEventListener("scroll", updateLogoVisibility);
      document.removeEventListener("scroll", updateLogoVisibility, true);
    };
  }, []);

  return (
    <>
      <a
        href="https://web.whatsapp.com/send?phone=917019436720"
        className="whatsapp-btn"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.535 5.856L.057 23.215a.75.75 0 00.916.927l5.487-1.44A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.735 9.735 0 01-4.964-1.36l-.356-.212-3.685.967.984-3.594-.232-.37A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
        </svg>
      </a>

      <nav id="navbar">
        <div className="nav-container">
          <a href="#hero" className={`nav-logo desktop-logo-only${isLogoVisible ? "" : " nav-logo--hidden"}`}>
            <div className="nav-logo-bg">
              <img src={logo} alt="Zentrax" />
              <div className="nav-brand-text">
                <span className="nav-brand-name">ZENTRAX</span>
                <span className="nav-brand-sub">CONSTRUCTION</span>
              </div>
            </div>
          </a>
          <ul className="nav-links">
            <li>
              <a href="#hero">Home</a>
            </li>
            <li>
              <a href="#philosophy">Philosophy</a>
            </li>
            <li>
              <a href="#portfolio">Portfolio</a>
            </li>
            <li>
              <a href="#capabilities">Capabilities</a>
            </li>
            <li>
              <a href="#properties">Properties</a>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <a href="#contact" className="nav-cta">
                Contact
              </a>
            </li>
          </ul>
          <button className={`hamburger${isMenuOpen ? " open" : ""}`} aria-label="Menu" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((open) => !open)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <div className={`mobile-menu${isMenuOpen ? " open" : ""}`}>
          <a href="#hero" onClick={() => setIsMenuOpen(false)}>Home</a>
          <a href="#philosophy" onClick={() => setIsMenuOpen(false)}>Philosophy</a>
          <a href="#portfolio" onClick={() => setIsMenuOpen(false)}>Portfolio</a>
          <a href="#capabilities" onClick={() => setIsMenuOpen(false)}>Capabilities</a>
          <a href="#properties" onClick={() => setIsMenuOpen(false)}>Properties</a>
          <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
          <a href="#contact" className="nav-cta" onClick={() => setIsMenuOpen(false)}>Contact</a>
        </div>
      </nav>
    </>
  );
}

export default NavbarSection;
