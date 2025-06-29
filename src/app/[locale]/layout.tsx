import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import {
  getTranslations
} from 'next-intl/server';
import "./globals.css";
import './tailwind.css';

const inter = Inter({ subsets: ["latin"] });

type Props = {
  children: React.ReactNode;
  params: {locale: string};
};

export async function generateMetadata({
  params: {locale}
}: Omit<Props, 'children'>): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'index'});
  return {
    // metadataBase: new URL('http://localhost:3000'),
    title: t('title'),
    description: t('desc'),
    icons: {
      icon: '/gonglu.png',
      shortcut: '/gonglu.png',
      apple: '/gonglu.png',
    },
  };
}

export default function BasicLayout({children, params: {locale}}: Readonly<Props>) {
  return (
    <html lang={locale}>
      <head>
        <link rel="icon" type="image/png" href="/gonglu.png" />
        <link rel="shortcut icon" type="image/png" href="/gonglu.png" />
        <link rel="apple-touch-icon" href="/gonglu.png" />
      </head>
      <body className={inter.className}>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}