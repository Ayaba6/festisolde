export const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
        {/* L'effet de miroitement (Shimmer) */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Info Skeleton */}
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          {/* Category */}
          <div className="h-2 w-16 bg-gray-100 rounded-full" />
          {/* Title */}
          <div className="h-4 w-full bg-gray-100 rounded-full" />
          <div className="h-4 w-2/3 bg-gray-100 rounded-full" />
        </div>

        {/* Price */}
        <div className="h-6 w-24 bg-gray-50 rounded-lg" />
      </div>
    </div>
  );
};