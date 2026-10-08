import { useState, useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Users,
  Tag
} from 'lucide-react';
import { downloadBackup, readBackupFile, importBackup } from '../utils/backup';
import { resetDatabase } from '../db/seed';
import { seedSampleProducts, clearAllProducts } from '../utils/sampleData';
import { useCategories } from '../hooks/useDatabase';
import Alert from './Alert';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';

export default function SettingsManager() {
  const categories = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [dangerAction, setDangerAction] = useState<'reset' | 'clear' | null>(null);

  const handleDownloadBackup = async () => {
    setLoading(true);
    try {
      await downloadBackup();
      setAlert({ type: 'success', message: 'Backup descargado exitosamente' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al crear backup: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const backupData = await readBackupFile(file);
      await importBackup(backupData);
      setAlert({ type: 'success', message: 'Backup importado exitosamente' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al importar backup: ' + (error as Error).message });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLoadSampleData = async () => {
    setLoading(true);
    try {
      await seedSampleProducts();
      setAlert({ type: 'success', message: 'Productos de ejemplo cargados' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al cargar productos: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDangerModal = (action: 'reset' | 'clear') => {
    setDangerAction(action);
    setShowDangerModal(true);
  };

  const handleDangerAction = async () => {
    setLoading(true);
    try {
      if (dangerAction === 'reset') {
        await resetDatabase();
        setAlert({ type: 'success', message: 'Base de datos reiniciada. Recargando...' });
        setTimeout(() => window.location.reload(), 2000);
      } else if (dangerAction === 'clear') {
        await clearAllProducts();
        setAlert({ type: 'success', message: 'Todos los productos eliminados' });
      }
      setShowDangerModal(false);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {alert && (
        <div className="mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Configuración</h2>

      <div className="space-y-6">
        {/* Backup y Restauración */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary-600" />
              Respaldo de Datos
            </h3>
            <p className="text-gray-600 mb-6">
              Crea copias de seguridad de toda tu información para proteger tus datos.
              Es recomendable hacer backups diarios al finalizar el día.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <Download className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Exportar Backup</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Descarga un archivo con todos tus datos
                </p>
                <button 
                  onClick={handleDownloadBackup}
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Descargar Backup'}
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <Upload className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Importar Backup</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Restaura tus datos desde un archivo
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="btn btn-secondary w-full"
                >
                  Seleccionar Archivo
                </button>
              </div>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Recomendaciones:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Realiza backups diarios al finalizar tu jornada</li>
                    <li>Guarda los backups en un lugar seguro (USB, correo, nube)</li>
                    <li>Mantén al menos 3 backups de diferentes días</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary-600" />
              Categorías de Productos
            </h3>
            <p className="text-gray-600 mb-4">
              Las siguientes categorías están disponibles para organizar tus productos:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-3 border border-primary-200"
                >
                  <p className="font-medium text-primary-800">{category.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Datos de Prueba */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Datos de Prueba
            </h3>
            <p className="text-gray-600 mb-4">
              Carga productos de ejemplo para probar el sistema rápidamente.
            </p>
            <button 
              onClick={handleLoadSampleData}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Cargar Productos de Ejemplo'}
            </button>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">Información del Sistema</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Versión:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">PWA (Progressive Web App)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base de Datos:</span>
                <span className="font-medium">IndexedDB (Local)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-medium text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  100% Offline
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Zona de Peligro */}
        <div className="card border-2 border-red-200">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zona de Peligro
            </h3>
            <p className="text-gray-600 mb-6">
              Estas acciones son irreversibles. Úsalas con extrema precaución.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-800">Eliminar Todos los Productos</p>
                  <p className="text-sm text-red-600">
                    Elimina todos los productos pero mantiene ventas e historial
                  </p>
                </div>
                <button 
                  onClick={() => handleOpenDangerModal('clear')}
                  className="btn btn-danger flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-800">Resetear Base de Datos</p>
                  <p className="text-sm text-red-600">
                    Elimina TODO: productos, ventas, historial. Vuelve al estado inicial
                  </p>
                </div>
                <button 
                  onClick={() => handleOpenDangerModal('reset')}
                  className="btn btn-danger flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Resetear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Peligro */}
      <Modal
        isOpen={showDangerModal}
        onClose={() => !loading && setShowDangerModal(false)}
        title="⚠️ Confirmar Acción Peligrosa"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-800 mb-2">
                  Esta acción es IRREVERSIBLE
                </p>
                <p className="text-sm text-red-700">
                  {dangerAction === 'reset' 
                    ? 'Se eliminarán TODOS los datos: productos, ventas, historial de inventario. El sistema volverá al estado inicial.'
                    : 'Se eliminarán TODOS los productos del catálogo. Las ventas históricas se mantendrán.'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Recomendación:</strong> Crea un backup antes de continuar.
            </p>
          </div>

          <p className="text-gray-700 text-center font-medium">
            ¿Estás completamente seguro de que deseas continuar?
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setShowDangerModal(false)}
              disabled={loading}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleDangerAction}
              disabled={loading}
              className="btn btn-danger flex-1"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Sí, Continuar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
