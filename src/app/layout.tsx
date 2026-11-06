import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#004AAD',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://dimsummentai-mamifayy.vercel.app'),
  title: 'Dimsummentai Mamifayy - Pesan Dimsum Mentai Gurih & Creamy',
  description:
    'Katalog pemesanan mandiri Dimsummentai Mamifayy. Ready stock setiap hari: Dimsum Mentai, Ayam Original, Mix Platter, dan Dimsum Tart Birthday.',
  applicationName: 'Dimsummentai Mamifayy',
  appleWebApp: {
    capable: true,
    title: 'Mamifayy',
    statusBarStyle: 'default',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo-square.png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/logo-square.png' },
    ],
    shortcut: '/logo-square.png',
  },
  openGraph: {
    title: 'Dimsummentai Mamifayy',
    description: 'Pesan Dimsum Mentai Gurih & Creamy Langsung dari Dapur Mamifayy',
    url: 'https://dimsummentai-mamifayy.vercel.app',
    siteName: 'Dimsummentai Mamifayy',
    images: [
      {
        url: '/logo-square.png',
        width: 800,
        height: 800,
        alt: 'Logo Dimsummentai Mamifayy',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mamifayy" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#004AAD" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
