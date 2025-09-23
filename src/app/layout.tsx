import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthInitializer } from "@/components/auth/AuthInitializer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthInitializer>
          <main>{children}</main>
          <Toaster />
        </AuthInitializer>
      </body>
    </html>
  );
}
