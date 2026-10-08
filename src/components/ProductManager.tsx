import { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useProducts, useCategories } from '../hooks/useDatabase';
import { createProduct, updateProduct, deleteProduct } from '../db/products';
import Modal from './Modal';
import Alert from './Alert';
import LoadingSpinner from './LoadingSpinner';
import { formatCurrency } from '../utils/format';
import { Product } from '../types';

export default function ProductManager() {
  const products = useProducts();
  const categories = useCategories();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    imageUrl: '',
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString(),
        imageUrl: product.imageUrl || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: categories[0]?.name || '',
        price: '',
        stock: '',
        imageUrl: '🥖',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      imageUrl: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const price = parseFloat(formData.price);
      const stock = parseInt(formData.stock);

      if (isNaN(price) || price <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }

      if (isNaN(stock) || stock < 0) {
        throw new Error('El stock debe ser mayor o igual a 0');
      }

      if (editingProduct) {
        // Actualizar producto
        await updateProduct(editingProduct.id, {
          name: formData.name,
          category: formData.category,
          price,
          stock,
          imageUrl: formData.imageUrl || undefined,
        });

        setAlert({ type: 'success', message: 'Producto actualizado correctamente' });
      } else {
        // Crear producto nuevo
        await createProduct({
          name: formData.name,
          category: formData.category,
          price,
          stock,
          imageUrl: formData.imageUrl || undefined,
        });

        setAlert({ type: 'success', message: 'Producto creado correctamente' });
      }

      handleCloseModal();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = confirm(
      `¿Estás seguro de eliminar el producto "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteProduct(product.id);
      setAlert({ type: 'success', message: 'Producto eliminado correctamente' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: (error as Error).message });
    }
  };

  // Emojis comunes para productos de panadería
  const commonEmojis = ['🥖', '🥐', '🍞', '🥯', '🥨', '🍩', '🧁', '🎂', '🍰', '🥟', '👑'];

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Productos</h2>
          <p className="text-gray-600 mt-1">
            Total: {products.length} productos
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Tabla de Productos */}
      <div className="card">
        <div className="card-body">
          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay productos registrados</p>
              <button 
                onClick={() => handleOpenModal()}
                className="btn btn-primary mt-4"
              >
                Agregar Primer Producto
              </button>
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
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                      <td className="py-3 px-4 font-medium text-primary-600">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          product.stock === 0 
                            ? 'bg-red-100 text-red-700'
                            : product.stock < 10
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {product.stock} pzs
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal de Crear/Editar */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Ej: Concha de Chocolate"
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="input"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Emoji/Icono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icono (Emoji)
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: emoji })}
                  className={`w-12 h-12 rounded-lg border-2 text-2xl transition-all ${
                    formData.imageUrl === emoji
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="input"
              placeholder="O ingresa un emoji personalizado"
              maxLength={2}
            />
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
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : editingProduct ? (
                'Actualizar'
              ) : (
                'Crear Producto'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
