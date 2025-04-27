import { Metadata } from "next";

export const getMetadata = (_metadata: {
  title: string;
  description: string;
  images: string;
  icon: string;
}) => {
  const metadata: Metadata = {
    title: _metadata.title,
    description: _metadata.description,
    icons: _metadata.icon,
    twitter: {
      card: "summary_large_image",
      creator: "@apoorveth",
      title: _metadata.title,
      description: _metadata.description,
      images: _metadata.images,
    },
    openGraph: {
      type: "website",
      title: _metadata.title,
      description: _metadata.description,
      images: _metadata.images,
    },
    robots: "index, follow",
  };

  return metadata;
};
