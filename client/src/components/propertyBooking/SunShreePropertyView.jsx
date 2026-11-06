import React from "react";
import { useNavigate } from "react-router-dom";
import SunShreeWhatsAppAssistant from "./SunShreeWhatsAppAssistant";

const SUNSHREE_WHATSAPP_NUMBER = "919035999272";
const DEFAULT_BOOKING_LINKS = [
  {
    platformName: "Airbnb",
    bookingUrl: "https://www.airbnb.com/rooms/1794374262320072215?unique_share_id=6cafc121-b721-4aea-823c-56fdf6a54847&viralityEntryPoint=1&s=76",
  },
  {
    platformName: "Agoda",
    bookingUrl: "https://www.agoda.com/weekend-vibes-balcony-views-family-comfort/hotel/mysore-in.html",
  },
];

const makeWhatsAppUrl = (settings, enquiryType) => {
  const property = settings?.property || {};
  const configuredMessage = enquiryType === "Residential accommodation enquiry"
    ? settings?.residentialEnquiryMessage
    : settings?.whatsapp?.message;
  const message = [
    configuredMessage || "Hello, I am interested in SunShree. Please share more details.",
    `Enquiry type: ${enquiryType}`,
    `Property: ${property.name || "SunShree"}`,
    property.address,
  ].filter(Boolean).join("\n\n");
  return `https://web.whatsapp.com/send?phone=${SUNSHREE_WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
};

function ResidentialPhoto({ image, index }) {
  const [unavailable, setUnavailable] = React.useState(false);

  if (unavailable) {
    return <div className="sunshree-image-placeholder" role="img" aria-label={`SunShree residential photo ${index + 1} unavailable`}>SunShree photo unavailable</div>;
  }

  return (
    <img
      src={image}
      alt={`SunShree residential accommodation ${index + 1}`}
      loading="lazy"
      onLoad={(event) => event.currentTarget.classList.add("loaded")}
      onError={() => setUnavailable(true)}
    />
  );
}

export default function SunShreePropertyView({ settings, preview = false }) {
  const navigate = useNavigate();
  const property = settings?.property || {};
  const address = property.address && !/^sunshree\b/i.test(property.address.trim())
    ? `SunShree, ${property.address}`
    : property.address;
  const configuredLinks = settings?.bookingLinks || [];
  const links = configuredLinks.length || settings?.bookingLinksConfigured
    ? configuredLinks.filter((link) => link.isActive !== false && link.bookingUrl)
    : DEFAULT_BOOKING_LINKS;
  const airbnbLink = links.find((link) => link.platformName.toLowerCase() === "airbnb");
  const agodaLink = links.find((link) => link.platformName.toLowerCase() === "agoda");
  const otherLinks = links.filter((link) => !["airbnb", "agoda"].includes(link.platformName.toLowerCase()));
  const images = (property.images?.length ? property.images : [property.image]).filter(Boolean);

  if (!preview && !settings?.propertyPageEnabled) {
    return <main className="sunshree-public-page"><p className="sunshree-unavailable">SunShree booking information is not currently available.</p></main>;
  }

  return (
    <main className="sunshree-public-page">
      {!preview && <header className="sunshree-public-header">
        <a className="sunshree-brand" href="/">ZENTRAX <span>CONSTRUCTION</span></a>
        <a className="sunshree-existing-properties" href="/properties">Existing properties</a>
        <button className="sunshree-page-close" type="button" aria-label="Close SunShree booking page" onClick={() => navigate("/")}>
          <span aria-hidden="true">×</span>
        </button>
      </header>}

      <section className="sunshree-category-section" id="residential">
        <div className="sunshree-category-copy">
          <p className="sunshree-property-eyebrow">RESIDENTIAL ACCOMMODATION</p>
          <h1>{property.name || "SunShree"}</h1>
          {address && <p className="sunshree-property-address">{address}</p>}
          {property.description && <p className="sunshree-property-description">{property.description}</p>}
          <p className="sunshree-booking-note">Residential enquiries are requests for information only. They are not confirmed bookings.</p>
          <a className="sunshree-residential-enquiry" href={makeWhatsAppUrl(settings, "Residential accommodation enquiry")} target="_blank" rel="noopener noreferrer">
            Enquire about residential accommodation
          </a>
        </div>
        {images.length > 0 ? (
          <div className="sunshree-residential-gallery" aria-label="SunShree residential photos">
            {images.map((image, index) => <ResidentialPhoto key={`${image}-${index}`} image={image} index={index} />)}
          </div>
        ) : <div className="sunshree-image-placeholder">Verified SunShree residential photographs will appear here.</div>}
        <a className="sunshree-residential-whatsapp" href={makeWhatsAppUrl(settings, "Residential accommodation enquiry")} target="_blank" rel="noopener noreferrer">
          WhatsApp about residential accommodation
        </a>
      </section>

      <section className="sunshree-category-section sunshree-short-stay-section" id="short-stay">
        <div className="sunshree-category-copy">
          <p className="sunshree-property-eyebrow">AIRBNB / SHORT STAY</p>
          <h2>Book a short stay</h2>
          <p className="sunshree-property-description">Find a short-term stay for weekends, holidays, or a visit to Mysuru. Choose a booking platform to see its listing and availability.</p>
        </div>
        <div className="sunshree-booking-links" aria-label="Short-stay booking platforms">
          {airbnbLink && <a href={airbnbLink.bookingUrl} target="_blank" rel="noopener noreferrer">Book on Airbnb</a>}
          {agodaLink && <a href={agodaLink.bookingUrl} target="_blank" rel="noopener noreferrer">Book on Agoda</a>}
          {otherLinks.map((link, index) => <a key={`${link.platformName}-${index}`} href={link.bookingUrl} target="_blank" rel="noopener noreferrer">Book on {link.platformName}</a>)}
        </div>
        <p className="sunshree-booking-note">Airbnb and Agoda are separate listings and may represent different accommodation units. Availability and reservations are handled by each platform; booking availability is not synchronized with this website.</p>
        {settings?.whatsapp?.enabled && <a className="sunshree-short-stay-whatsapp" href={makeWhatsAppUrl(settings, "Airbnb or short-stay booking assistance")} target="_blank" rel="noopener noreferrer">
          WhatsApp short-stay assistance
        </a>}
      </section>
      {!preview && <SunShreeWhatsAppAssistant enabled={settings?.whatsapp?.enabled} />}
    </main>
  );
}
