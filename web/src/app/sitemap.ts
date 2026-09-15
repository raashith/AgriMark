import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://agrimark-six.vercel.app';

  const routes = [
    '',
    '/marketplace',
    '/farmers',
    '/buyers',
    '/market-prices',
    '/weather',
    '/finance',
    '/tasks',
    '/documents',
    '/ai-assistant',
    '/storage',
    '/logistics',
    '/about',
    '/contact',
    '/help',
    '/faq',
    '/privacy',
    '/terms',
    '/cookies',
    '/accessibility',
    '/security',
    '/refund-policy',
    '/shipping-policy',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
