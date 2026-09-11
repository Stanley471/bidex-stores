import { notFound } from 'next/navigation';
import { storefrontService } from '@/services/storefront.service';
import { ProductDetailView } from '@/components/products/ProductDetailView';

interface ProductDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { slug } = await params;
  const product = await storefrontService.getStorefrontProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <ProductDetailView product={product} />
    </main>
  );
}
