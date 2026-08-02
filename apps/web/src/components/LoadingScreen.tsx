export function LoadingScreen({ label = 'Memuat...' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
        <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}
