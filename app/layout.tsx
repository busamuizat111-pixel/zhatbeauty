import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KasuwaDesk - WhatsApp Sales Management for Nigerian Businesses',
  description:
    'All-in-one WhatsApp CRM, product catalogue, follow-ups, inventory, and order fulfillment system for Nigerian merchants.',
  openGraph: {
    title: 'KasuwaDesk - WhatsApp Sales Management for Nigerian Businesses',
    description:
      'All-in-one WhatsApp CRM, product catalogue, follow-ups, inventory, and order fulfillment system for Nigerian merchants.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
