import { useState } from 'react';
import { Edit, TrendingUp, AlertCircle } from 'lucide-react';
import { useProducts, useQuickStats } from '../hooks/useDatabase';
import { useAuthStore } from '../store/authStore';
import { updateStock } from '../db/products';
import Modal from './Modal';
import Alert from './Alert';
import LoadingSpinner from './LoadingSpinner';
import { formatCurrency } from '../utils/format';
import { Product } from '../types';

export default function InventoryManager() {
  const products = useProducts();
  const stats = useQuickStats();
  const { currentUser } = useAuthStore();

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState('');
  const [reason, setReason] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setNewStock(product.stock.toString());
    setReason('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setNewStock('');
    setReason('');
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !currentUser) return;

    setLoading(true);

    try {
      const stock = parseInt(newStock);

      if (isNaN(stock) || stock < 0) {
        throw new Error('El stock debe ser un número mayor o igual a 0');
      }

      if (!reason.trim()) {
        throw new Error('Debes proporcionar una razón para el ajuste');
      }

      await updateStock(
        selectedProduct.id,
        stock,
        reason,
        currentUser.id,
        currentUser.username
      );

      setAlert({ 
        type: 'success', 
        message: `Stock de "${selectedProduct.name}" actualizado correctamente` 
      });
      handleCloseModal();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const inventoryValue = products.reduce((total, p) => total + (p.price * p.stock), 0);

  return (
    <div>
      {/* Alertas */}
      {alert && (
        <div className="mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Control de Inventario</h2>
        <p className="text-gray-600 mt-1">
          Gestiona el stock de tus productos
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Productos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStock}</p>
                <p className="text-xs text-gray-500 mt-1">piezas</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Bajo</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.lowStock}</p>
                <p className="text-xs text-gray-500 mt-1">productos</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sin Stock</p>
                <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
                <p className="text-xs text-gray-500 mt-1">productos</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valor del Inventario */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Total del Inventario</p>
              <p className="text-3xl font-bold text-primary-600">
                {formatCurrency(inventoryValue)}
              </p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Calculado al precio de venta actual</p>
              <p>{stats.totalStock} piezas × precio promedio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Inventario */}
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold mb-4">Listado de Inventario</h3>
          
          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No hay productos en el inventario</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Producto</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoría</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Precio</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Valor</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .sort((a, b) => {
                      // Ordenar: sin stock, stock bajo, normal
                      if (a.stock === 0 && b.stock !== 0) return -1;
                      if (a.stock !== 0 && b.stock === 0) return 1;
                      if (a.stock < 10 && b.stock >= 10) return -1;
                      if (a.stock >= 10 && b.stock < 10) return 1;
                      return a.name.localeCompare(b.name);
                    })
                    .map((product) => (
                      <tr 
                        key={product.id} 
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          product.stock === 0 ? 'bg-red-50' : 
                          product.stock < 10 ? 'bg-yellow-50' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center text-xl">
                              {product.imageUrl || '🥖'}
                            </div>
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {product.category}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            product.stock === 0 
                              ? 'bg-red-100 text-red-700'
                              : product.stock < 10
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {product.stock} pzs
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-primary-600">
                          {formatCurrency(product.price * product.stock)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleOpenModal(product)}
                              className="btn btn-primary btn-sm flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Actualizar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Actualizar Stock */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={`Actualizar Stock: ${selectedProduct?.name}`}
        size="md"
      >
        <form onSubmit={handleUpdateStock} className="space-y-4">
          {/* Stock Actual */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Stock Actual:</p>
            <p className="text-2xl font-bold text-gray-900">
              {selectedProduct?.stock} piezas
            </p>
          </div>

          {/* Nuevo Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nuevo Stock *
            </label>
            <input
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              className="input input-lg text-2xl font-bold"
              placeholder="0"
              required
              autoFocus
            />
          </div>

          {/* Diferencia */}
          {newStock && selectedProduct && (
            <div className={`rounded-lg p-4 ${
              parseInt(newStock) > selectedProduct.stock
                ? 'bg-green-50 border border-green-200'
                : parseInt(newStock) < selectedProduct.stock
                ? 'bg-red-50 border border-red-200'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <p className="text-sm text-gray-600">Ajuste:</p>
              <p className="text-xl font-bold">
                {parseInt(newStock) - selectedProduct.stock > 0 ? '+' : ''}
                {parseInt(newStock) - selectedProduct.stock} piezas
              </p>
            </div>
          )}

          {/* Razón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón del Ajuste *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input mb-2"
              required
            >
              <option value="">Selecciona una razón</option>
              <option value="Horneada del día">Horneada del día</option>
              <option value="Producción adicional">Producción adicional</option>
              <option value="Corrección de inventario">Corrección de inventario</option>
              <option value="Merma o desperdicio">Merma o desperdicio</option>
              <option value="Devolución">Devolución</option>
              <option value="Inventario inicial">Inventario inicial</option>
              <option value="Otro">Otro</option>
            </select>
            {reason === 'Otro' && (
              <input
                type="text"
                className="input"
                placeholder="Especifica la razón"
                onChange={(e) => setReason(e.target.value)}
                required
              />
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Actualizar Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
