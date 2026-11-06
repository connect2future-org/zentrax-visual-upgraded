function PropertyModalSection() {
  return (
    <div id="propertyModal" className="prop-modal-overlay" role="dialog" aria-modal="true">
      <div className="prop-modal-box">
        <button className="prop-modal-close" id="modalClose" aria-label="Close" type="button">
          &times;
        </button>
        <div className="prop-modal-img-wrap">
          <div className="prop-modal-gallery">
            <button className="gallery-nav gallery-prev" id="galleryPrev" type="button" aria-label="Previous image">
              ←
            </button>
            <div className="prop-modal-img-inner">
              <img id="modalImg" src="" alt="" />
              <span className="gallery-counter" id="galleryCounter"></span>
            </div>
            <button className="gallery-nav gallery-next" id="galleryNext" type="button" aria-label="Next image">
              →
            </button>
          </div>
          <div className="prop-modal-badge" id="modalBadge"></div>
          <div className="gallery-thumbs" id="galleryThumbs" aria-label="Property image thumbnails"></div>
          <div className="gallery-dots" id="galleryDots" aria-label="Property image pagination"></div>
        </div>
        <div className="prop-modal-body">
          <div className="prop-modal-cat" id="modalCat"></div>
          <h3 className="prop-modal-title" id="modalTitle"></h3>
          <div className="prop-modal-location" id="modalLocation">
            <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span id="modalLocationText"></span>
          </div>
          <p className="prop-modal-desc" id="modalDesc"></p>
          <div className="prop-modal-meta">
            <div className="prop-modal-meta-item">
              <span className="prop-modal-meta-label">Status</span>
              <span className="prop-modal-meta-val" id="modalStatus"></span>
            </div>
            <div className="prop-modal-meta-item">
              <span className="prop-modal-meta-label">Price / Lease</span>
              <span className="prop-modal-meta-val" id="modalPrice"></span>
            </div>
          </div>
          <div className="prop-modal-actions">
            <a href="#contact" className="btn-gold modal-enquire-btn">
              Enquire Now
            </a>
            <a
              href="https://web.whatsapp.com/send?phone=917019436720"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-dark modal-wa-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" style={{ marginRight: "6px" }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.535 5.856L.057 23.215a.75.75 0 00.916.927l5.487-1.44A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.735 9.735 0 01-4.964-1.36l-.356-.212-3.685.967.984-3.594-.232-.37A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyModalSection;
