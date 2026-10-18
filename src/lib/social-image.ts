// Shared explicitly: a page's openGraph object replaces the layout's object.
export const socialImage = {
  // The custom domain's Pages certificate is pending. Keep crawler downloads
  // on a verified HTTPS host; the same PNG is also available in the site export.
  url: "https://raw.githubusercontent.com/AnubisWatch/anubiswatch-site/main/public/og.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "AnubisWatch — The Judgment Never Sleeps. Self-hosted uptime and synthetic monitoring in one Go binary. Gold Anubis guardian with a green heartbeat.",
};

export const socialTwitter = {
  card: "summary_large_image" as const,
  images: [{ url: socialImage.url, alt: socialImage.alt }],
};
