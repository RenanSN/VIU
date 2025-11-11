// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Importa os estilos globais

import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VIU",
  description: "App de upload e analytics de mídia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // NOTA: Removemos o 'className="dark"' e o 'suppressHydrationWarning'.
    // O nosso CSS fará todo o trabalho.
    <html lang="pt-br">
      <body className={inter.className}>
        <AuthProvider>
          <Toaster 
            position="top-center" 
            toastOptions={{
              // Estilos para o modo escuro
              style: {
                background: '#2b2b2b', // var(--card)
                color: '#f0f0f0',      // var(--foreground)
                border: '1px solid #4b5563', // var(--border)
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}