import { Product, P } from './products';

const STORAGE_KEY = 'bookshelf_custom_books';

export function getClientBooks(): Product[] {
  if (typeof window === 'undefined') return P;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with P to ensure all default books and custom books exist
        const customMap = new Map<number, Product>();
        P.forEach(b => customMap.set(b.id, b));
        parsed.forEach((b: Product) => {
          if (b && b.id) customMap.set(b.id, b);
        });
        return Array.from(customMap.values());
      }
    }
  } catch {}
  return P;
}

export function saveClientBooks(books: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch {}
}

export function addClientBook(book: Product): Product[] {
  const current = getClientBooks();
  const filtered = current.filter(b => b.id !== book.id && b.slug !== book.slug);
  const updated = [book, ...filtered];
  saveClientBooks(updated);
  return updated;
}

export function deleteClientBook(id: number): Product[] {
  const current = getClientBooks();
  const updated = current.filter(b => b.id !== id);
  saveClientBooks(updated);
  return updated;
}
