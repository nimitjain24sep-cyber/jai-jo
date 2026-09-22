import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import CustomerShell from '@/components/CustomerShell';

export const metadata: Metadata = {
  title: 'Jai Jinendra Grocery Mart - Jaora, MP',
  description:
    'Fresh Groceries & Daily Needs Delivered Fast in Jaora, Madhya Pradesh. Atta, Dals, Spices, Edible Oils, Dairy & Cleaning Essentials.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#fbfbf8] text-slate-900 min-h-screen antialiased overflow-x-hidden max-w-full w-full">
        <LanguageProvider>
          <CartProvider>
            <CustomerShell>{children}</CustomerShell>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
