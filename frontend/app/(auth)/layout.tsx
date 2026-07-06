/**
 * Auth layout — no header/footer, full-height centered card.
 * The dot pattern from globals.css body::before still shows through.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  );
}
