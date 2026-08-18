import type { Metadata } from 'next';
import AdminBooksClient from './AdminBooksClient';

export const metadata: Metadata = {
  title: 'Book Manager — Admin Dashboard',
  robots: { index: false, follow: false },
};

export default function AdminBooksPage() {
  return <AdminBooksClient />;
}
