// src/utils/socialLinkBuilder.ts
type Platforms = "instagram" | "tiktok" | "telegram" | "snapchat" | "twitter";

const baseUrls: Record<Platforms, string> = {
  instagram: "https://instagram.com/",
  tiktok: "https://www.tiktok.com/@",
  telegram: "https://t.me/",
  snapchat: "https://www.snapchat.com/add/",
  twitter: "https://twitter.com/",
};

export function buildSocialLinks(socials: Record<string, string | undefined>) {
  const links: Record<string, string> = {};
  for (const [platform, username] of Object.entries(socials)) {
    if (username && baseUrls[platform as Platforms]) {
      links[platform] = baseUrls[platform as Platforms] + username;
    }
  }
  return links;
}
