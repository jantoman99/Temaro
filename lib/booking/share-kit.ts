const DEFAULT_INSTAGRAM_BIO = "Rezervace online:";

function buildTrackedBookingUrl(bookingUrl: string, source: string, sourceDetail: string) {
  const url = new URL(bookingUrl);
  url.searchParams.set("source", source);
  url.searchParams.set("source_detail", sourceDetail);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "profile");
  url.searchParams.set("utm_campaign", "booking_cta");

  return url.toString();
}

export function getBookingShareKit({
  bookingUrl,
  businessName,
}: {
  bookingUrl: string;
  businessName: string;
}) {
  const googleBusinessProfileUrl = buildTrackedBookingUrl(bookingUrl, "google", "business_profile");
  const instagramBio = `${DEFAULT_INSTAGRAM_BIO} ${bookingUrl}`;
  const instagramStory = `Objednejte se k ${businessName} online. Vyberete službu, termín a potvrzení přijde e-mailem. ${bookingUrl}`;
  const qrImageUrl = `https://quickchart.io/qr?size=320&text=${encodeURIComponent(bookingUrl)}`;

  return {
    googleBusinessProfileUrl,
    instagramBio,
    instagramStory,
    qrImageUrl,
  };
}
