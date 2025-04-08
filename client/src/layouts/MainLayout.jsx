import { Outlet } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import PageTransition from '../components/ui/PageTransition';

const MainLayout = () => {
  const { cartCount } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={cartCount} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout; 