import logo from "../../assets/logo.png";

function FooterSection() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-inner">
          <div className="footer-brand">
            <div className="footer-logo-bg">
              <img src={logo} alt="Zentrax" className="footer-logo" />
            </div>
            <p>
              Engineering Modern Spaces with Precision &amp; Excellence. Your trusted construction and
              architecture partner.
            </p>
            <a
              href="https://www.instagram.com/_zentrax_constructions_?igsh=MW9qaXJvZW5jYnl1dg=="
              target="_blank"
              rel="noopener noreferrer"
              className="footer-ig"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              Instagram
            </a>
          </div>
          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <ul>
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
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>
          <div className="footer-links-col">
            <h4>Services</h4>
            <ul>
              <li>
                <a href="#capabilities">Find a Space</a>
              </li>
              <li>
                <a href="#capabilities">Design a Space</a>
              </li>
              <li>
                <a href="#capabilities">Build a Space</a>
              </li>
              <li>
                <a href="#capabilities">Specialize a Space</a>
              </li>
              <li>
                <a href="#capabilities">Maintain a Space</a>
              </li>
            </ul>
          </div>
          <div className="footer-links-col">
            <h4>Contact</h4>
            <ul>
              <li>
                <a href="https://web.whatsapp.com/send?phone=917019436720" target="_blank" rel="noopener noreferrer">+91 70194 36720</a>
              </li>
              <li>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=zentrax1234%40gmail.com" target="_blank" rel="noopener noreferrer">zentrax1234@gmail.com</a>
              </li>
              <li>Mon–Sat: 9:00 AM – 7:00 PM</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>© 2025 Zentrax Construction. Crafted with Precision.</span>
          <span className="footer-tagline">Engineering Modern Spaces</span>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
