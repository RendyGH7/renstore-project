import { BrowserRouter } from 'react-router-dom';
import { LocaleProvider } from './contexts/LocaleContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ScrollToTop from './components/ScrollToTop';
import AppRoutes from './routes';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <LocaleProvider>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </LocaleProvider>
    </BrowserRouter>
  );
}

export default App;
