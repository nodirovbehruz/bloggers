import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { LanguageProvider } from './contexts/LanguageContext';

export const metadata = {
  title: 'Blogger Awards — Голосование за лучших блогеров',
  description: 'Платформа для голосования за лучших блогеров. Поддержи своего фаворита, голосуй бесплатно или VIP голосом!',
  keywords: 'блогеры, голосование, конкурс, награждение, блогер, инфлюенсер',
  openGraph: {
    title: 'Blogger Awards — Голосование за лучших блогеров',
    description: 'Поддержи своего любимого блогера! Голосуй бесплатно или VIP голосом.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Monsieur+La+Doulaise&family=Montserrat:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-text-primary font-body" suppressHydrationWarning>
        <LanguageProvider>
          <Header />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
