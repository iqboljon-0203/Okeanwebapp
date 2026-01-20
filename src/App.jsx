import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './router';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { ProductProvider } from './context/ProductContext';

import { Toaster } from 'react-hot-toast';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <UserProvider>
      <ProductProvider>
        <CartProvider>
          <Router>
            <div className="app-container">
              <Toaster position="top-center" reverseOrder={false} />
              <MainLayout>
                <AppRouter />
              </MainLayout>
            </div>
          </Router>
        </CartProvider>
      </ProductProvider>
    </UserProvider>
  );
}

export default App;
