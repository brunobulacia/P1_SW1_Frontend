import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { connectToServer } from "@/socket/socket-client";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Conectar al servidor de sockets al cargar el layout raíz
  // connectToServer();
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
