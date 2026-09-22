'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import MobileBottomDock from './MobileBottomDock';

export default function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between pb-16 md:pb-0">
      <Header />
      <main className="flex-1">{children}</main>
      <CartDrawer />
      <MobileBottomDock />
      <Footer />
    </div>
  );
}
