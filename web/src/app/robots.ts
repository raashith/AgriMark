import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/farmer/dashboard', '/buyer/orders'],
    },
    sitemap: 'https://agrimark-six.vercel.app/sitemap.xml',
  };
}
