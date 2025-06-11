import { Inter } from "next/font/google";
import "./globals.css";
import 'nprogress/nprogress.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Langflow File Uploader",
  description: "Upload a file to Langflow workflow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
