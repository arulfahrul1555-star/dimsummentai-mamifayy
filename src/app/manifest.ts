import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dimsummentai Mamifayy',
    short_name: 'Mamifayy',
    description: 'Katalog Pemesanan Dimsum Mentai Gurih, Creamy & Ditorch Sempurna Mamifayy',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FFFFFF',
    theme_color: '#004AAD',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/logo-square.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
