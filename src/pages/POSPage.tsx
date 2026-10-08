import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useProducts, useCategories } from '../hooks/useDatabase';
import { createSale } from '../db/sales';
import { 
  LogOut, 
  ShoppingCart, 
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign
} from 'lucide-react';
import Modal from '../components/Modal';
import NumericKeypad from '../components/NumericKeypad';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency } from '../utils/format';

export default function POSPage() {
  const { currentUser, logout } = useAuthStore();
  const { 
    items, 
    addItem, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotal, 
    getTotalItems 
  } = useCartStore();

  const products = useProducts();
  const categories = useCategories();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState('');
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const total = getTotal();
  const totalItems = getTotalItems();

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock === 0) {
      setAlert({ type: 'error', message: 'Producto sin stock' });
      return;
    }

    addItem(product);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    setShowPaymentModal(true);
    setAmountPaid('');
  };

  const handleCompleteSale = async () => {
    const paid = parseFloat(amountPaid);
    
    if (isNaN(paid) || paid < total) {
      setAlert({ type: 'error', message: 'Monto insuficiente' });
      return;
    }

    setProcessing(true);

    try {
      const change = paid - total;

      await createSale(
        items,
        total,
        paid,
        change,
        currentUser!.id,
        currentUser!.username
      );

      setAlert({ 
        type: 'success', 
        message: `Venta completada. Cambio: ${formatCurrency(change)}` 
      });

      clearCart();
      setShowPaymentModal(false);
      setAmountPaid('');
      
      // Auto-cerrar alerta después de 3 segundos
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error(error);
      setAlert({ 
        type: 'error', 
        message: 'Error al procesar la venta: ' + (error as Error).message 
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>
              <p className="text-sm text-gray-600">
                Cajero: <span className="font-medium">{currentUser?.username}</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Total en carrito */}
              <div className="bg-primary-50 px-4 py-2 rounded-lg">
                <p className="text-sm text-primary-600 font-medium">
                  {totalItems} artículos - {formatCurrency(total)}
                </p>
              </div>

              {/* Botón de Logout */}
              <button
                onClick={logout}
                className="btn btn-secondary flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Alertas */}
      {alert && (
        <div className="max-w-screen-2xl mx-auto px-4 pt-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {/* Contenido Principal */}
      <main className="max-w-screen-2xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Catálogo de Productos */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-body">
                {/* Búsqueda */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>

                {/* Categorías */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`btn whitespace-nowrap ${
                      selectedCategory === null ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    Todos ({products.length})
                  </button>
                  {categories.map((category) => {
                    const count = products.filter(p => p.category === category.name).length;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`btn whitespace-nowrap ${
                          selectedCategory === category.name ? 'btn-primary' : 'btn-secondary'
                        }`}
                      >
                        {category.name} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Grid de Productos */}
                <div className="product-grid">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No hay productos disponibles</p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const isOutOfStock = product.stock === 0;
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleAddToCart(product.id)}
                          disabled={isOutOfStock}
                          className={`product-card text-left ${
                            isOutOfStock ? 'product-card-disabled' : ''
                          }`}
                        >
                          <div className="p-4">
                            <div className="w-full h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-3 flex items-center justify-center text-5xl">
                              {product.imageUrl || '🥖'}
                            </div>
                            <h3 className="font-medium mb-1 truncate">{product.name}</h3>
                            <p className="text-lg font-bold text-primary-600">
                              {formatCurrency(product.price)}
                            </p>
                            <p className={`text-xs mt-1 ${
                              product.stock < 10 ? 'text-red-600 font-medium' : 'text-gray-500'
                            }`}>
                              Stock: {product.stock}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Carrito de Compras */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <div className="card-body">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  Carrito
                </h2>

                {/* Items del Carrito */}
                <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>El carrito está vacío</p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={item.productId} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.productName}</h4>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(item.unitPrice)} c/u
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-8 h-8 rounded bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-8 h-8 rounded bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="font-bold text-primary-600">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Resumen */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total de piezas:</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="space-y-2 mt-4">
                  <button
                    onClick={handleCheckout}
                    disabled={items.length === 0}
                    className="w-full btn btn-success btn-lg flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    Cobrar
                  </button>
                  
                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="w-full btn btn-secondary"
                    >
                      Limpiar Carrito
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Pago */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => !processing && setShowPaymentModal(false)}
        title="Procesar Pago"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-primary-50 rounded-lg p-4">
            <p className="text-sm text-primary-600 mb-1">Total a Cobrar:</p>
            <p className="text-3xl font-bold text-primary-700">
              {formatCurrency(total)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto Pagado:
            </label>
            <NumericKeypad
              value={amountPaid}
              onChange={setAmountPaid}
              maxLength={10}
            />
          </div>

          {amountPaid && parseFloat(amountPaid) >= total && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Cambio:</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(parseFloat(amountPaid) - total)}
              </p>
            </div>
          )}

          <button
            onClick={handleCompleteSale}
            disabled={!amountPaid || parseFloat(amountPaid) < total || processing}
            className="w-full btn btn-success btn-lg"
          >
            {processing ? (
              <LoadingSpinner size="sm" />
            ) : (
              'Completar Venta'
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
