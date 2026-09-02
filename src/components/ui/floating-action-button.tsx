export function FloatingActionButton({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-20 right-8 z-50 lg:static lg:bottom-auto lg:right-auto lg:z-auto">
      {children}
    </div>
  );
}