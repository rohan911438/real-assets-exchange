import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export const Layout = ({ children, showFooter = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};
