import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '../components/Toast';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { SocketProvider } from '../contexts/SocketContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { DEFAULT_CAMPUS_NAME } from '@campustuck/shared';

export const metadata: Metadata = {
  title: `CampusTuck - Online Store for ${DEFAULT_CAMPUS_NAME}`,
  description:
    'Order tuck shop snacks, ice-cold drinks, stationery, and student essentials at COMSATS University Islamabad (CUI) with campus pickup or hostel delivery (COD).',
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
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-canvas text-ink min-h-screen flex flex-col selection:bg-lime selection:text-ink font-sans">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <SocketProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <CartDrawer />
              </SocketProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
