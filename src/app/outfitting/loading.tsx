/**
 * Loading UI for the outfitting page.
 * Shows while the outfitting route segment is loading.
 */
export default function OutfittingLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading outfitting...</p>
        </div>
      </div>
    </div>
  );
}
