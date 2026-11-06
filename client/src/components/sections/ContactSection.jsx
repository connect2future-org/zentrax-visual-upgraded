function ContactSection() {
  return (
    <section id="contact" className="contact-section section">
      <div className="container">
        <div className="section-tag reveal">Get In Touch</div>
        <h2 className="section-title reveal">
          Let's Create Something
          <br />
          <em>Extraordinary</em>
        </h2>

        <div className="contact-grid">
          <div className="contact-info reveal">
            <div className="cinfo-item">
              <div className="cinfo-label">Working Hours</div>
              <div className="cinfo-val">Mon – Sat: 9:00 AM – 7:00 PM</div>
            </div>
            <div className="cinfo-item">
              <div className="cinfo-label">Alternative</div>
              <a href="https://web.whatsapp.com/send?phone=917019436720" className="cinfo-val cinfo-link" target="_blank" rel="noopener noreferrer">
                +91 70194 36720
              </a>
            </div>
            <div className="cinfo-item">
              <div className="cinfo-label">Email</div>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=zentrax1234%40gmail.com" className="cinfo-val cinfo-link" target="_blank" rel="noopener noreferrer">
                zentrax1234@gmail.com
              </a>
            </div>
            <a
              href="https://web.whatsapp.com/send?phone=917019436720"
              className="whatsapp-contact"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.535 5.856L.057 23.215a.75.75 0 00.916.927l5.487-1.44A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.735 9.735 0 01-4.964-1.36l-.356-.212-3.685.967.984-3.594-.232-.37A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          <form className="contact-form glass-form reveal" id="contactForm">
            <div className="form-group">
              <input type="text" id="contactName" name="name" placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <input type="email" id="contactEmail" name="email" placeholder="Email Address" required />
            </div>
            <div className="form-group">
              <input type="tel" id="contactPhone" name="phone" placeholder="Phone Number" />
            </div>
            <div className="form-group">
              <select id="contactService" name="service" defaultValue="">
                <option value="" disabled>
                  Service Category
                </option>
                <option>Find a Space - Residential &amp; Commercial Properties</option>
                <option>Design a Space - Architecture &amp; Interior Design</option>
                <option>Build a Space - Construction &amp; Engineering</option>
                <option>Specialize a Space - Smart &amp; Custom Solutions</option>
                <option>Maintain a Space - Repairs &amp; Facility Management</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <textarea id="contactMessage" name="message" rows="4" placeholder="Project Brief"></textarea>
            </div>
            <div id="formStatus" className="form-status" style={{ display: "none" }}></div>
            <button type="submit" className="btn-gold form-submit" id="submitBtn">
              Send Message
            </button>
          </form>
        </div>

        <div className="map-section reveal">
          <div className="map-header">
            <div className="section-tag" style={{ marginBottom: "0.5rem" }}>
              Visit Us
            </div>
            <h3 className="map-title">ZENTRAX CONSTRUCTIONS</h3>
            <p className="map-desc" style={{ marginBottom: 8 }}>
              Krishana building, near Nirmithi Kendra Road, Bogadi 2nd Stage North,
              Mysuru, Karnataka 570006
            </p>
            <div style={{ fontSize: 13, color: 'var(--dark)' }}>
              <div>Website: <a href="https://zentraxconstructions.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--dark)' }}>zentraxconstructions.com</a></div>
              <div>Plus code: 8J55+VF Mysuru, Karnataka</div>
            </div>
          </div>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps?q=ZENTRAX+CONSTRUCTIONS+Mysuru&output=embed"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Zentrax Location"
            ></iframe>
          </div>
          <div className="map-actions">
            <a
              href="https://www.google.com/maps/search/?api=1&query=ZENTRAX+CONSTRUCTIONS+Mysuru"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
                style={{ marginRight: "6px" }}
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              Open in Google Maps
            </a>
            <a href="https://web.whatsapp.com/send?phone=917019436720&text=Hello%2C%20please%20share%20directions%20to%20Zentrax%20Constructions." className="btn-outline" target="_blank" rel="noopener noreferrer">
              Ask for Directions on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
