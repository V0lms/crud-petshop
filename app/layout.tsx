import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PetShop',
  description: 'By Victor olmos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-100">
        {children}
        </body>
    </html>
  );
}
