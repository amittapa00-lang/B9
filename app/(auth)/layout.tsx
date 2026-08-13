export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-linear-to-r from-green-50 via-white to-green-100 flex items-center justify-center px-6">
      {children}
    </main>
  );
}