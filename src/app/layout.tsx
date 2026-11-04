import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dimsummentai Mamifayy - Pesan Dimsum Mentai Gurih & Creamy',
  description:
    'Katalog pemesanan mandiri Dimsummentai Mamifayy. Ready stock setiap hari: Dimsum Mentai, Ayam Original, Mix Platter, dan Pangsit Goreng.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
