import './globals.css';

export const metadata = {
  title: 'Finora Bank',
  description: 'Secure, fast, and borderless banking.',
  manifest: '/manifest.json', // Link to your manifest
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Finora',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: '#2563eb', // Matches your brand blue
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevents zooming on inputs
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}