import { Preloader } from "@/components/layout/Preloader";

/**
 * Global loading.tsx — Next.js automaticky renderuje pri route transitions
 * a pri Suspense fallbackoch.
 */
export default function Loading() {
  return <Preloader />;
}
