import type { MetadataRoute } from "next";

import {
  getBlogPosts,
  getEvents,
  getHotels,
  getHotelById,
  getTourPackages,
  getTransportation,
  getVisas,
} from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://elhamas.com";

function toAbsolute(path: string): string {
  return `${BASE_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: toAbsolute("/"), changeFrequency: "daily", priority: 1 },
    { url: toAbsolute("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: toAbsolute("/services"), changeFrequency: "weekly", priority: 0.8 },
    { url: toAbsolute("/packages"), changeFrequency: "daily", priority: 0.9 },
    { url: toAbsolute("/hotels"), changeFrequency: "daily", priority: 0.9 },
    { url: toAbsolute("/transportation"), changeFrequency: "weekly", priority: 0.8 },
    { url: toAbsolute("/visas"), changeFrequency: "weekly", priority: 0.8 },
    { url: toAbsolute("/blog"), changeFrequency: "daily", priority: 0.8 },
    { url: toAbsolute("/blog/articles"), changeFrequency: "daily", priority: 0.7 },
    { url: toAbsolute("/blog/events"), changeFrequency: "daily", priority: 0.7 },
    { url: toAbsolute("/contact"), changeFrequency: "monthly", priority: 0.6 },
  ];

  const [packages, hotels, transportation, visas, posts, events] = await Promise.all([
    getTourPackages(),
    getHotels(),
    getTransportation(),
    getVisas(),
    getBlogPosts(),
    getEvents(),
  ]);

  const [roomEntriesByHotel] = await Promise.all([
    Promise.all(
      hotels.map(async (hotel) => {
        const fullHotel = await getHotelById(hotel.id);
        const rooms = fullHotel?.rooms ?? [];
        return rooms.map((room) => ({
          url: toAbsolute(`/hotels/${hotel.id}/rooms/${room.id}`),
          lastModified: room.updated_at,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));
      }),
    ),
  ]);

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...packages.map((pkg) => ({
      url: toAbsolute(`/packages/${pkg.id}`),
      lastModified: pkg.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...hotels.map((hotel) => ({
      url: toAbsolute(`/hotels/${hotel.id}`),
      lastModified: hotel.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...roomEntriesByHotel.flat(),
    ...transportation.map((item) => ({
      url: toAbsolute(`/transportation/${item.id}`),
      lastModified: item.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...visas.map((item) => ({
      url: toAbsolute(`/visas/${item.id}`),
      lastModified: item.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: toAbsolute(`/blog/${post.slug}`),
      lastModified: post.updated_at || post.published_at || post.created_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...events.map((event) => ({
      url: toAbsolute(`/blog/events/${event.slug}`),
      lastModified: event.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  const deduped = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of [...staticRoutes, ...dynamicRoutes]) {
    deduped.set(entry.url, entry);
  }

  return [...deduped.values()];
}
