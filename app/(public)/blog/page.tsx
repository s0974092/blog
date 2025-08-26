
import { Suspense } from 'react';
import InitialPostFetcher from '@/components/blog/InitialPostFetcher';
import BlogCardSkeleton from '@/components/blog/BlogCardSkeleton';

// revalidate can be kept, allowing ISR and PPR to work together.
export const revalidate = 60;

const SKELETON_COUNT = 5;

export default function BlogPage() {
  return (
    <main className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 
        The BlogSearchBar is now part of the BlogList component, so it will be rendered 
        within the Suspense boundary. If we wanted it to appear instantly, we would need
        to lift its state management out of the BlogList component (e.g., to URL search params)
        and place the component here, outside of Suspense.
        For now, it will appear along with the fetched content.
      */}
      <Suspense 
        fallback={
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        }
      >
        <InitialPostFetcher />
      </Suspense>
    </main>
  );
}
