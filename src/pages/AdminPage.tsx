import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  LogOut, 
  Package, 
  TrendingUp, 
  Settings,
  Database,
  BarChart3
} from 'lucide-react';
import ProductManager from '../components/ProductManager';
import InventoryManager from '../components/InventoryManager';
import ReportsManager from '../components/ReportsManager';
import SettingsManager from '../components/SettingsManager';

type TabType = 'products' | 'inventory' | 'reports' | 'settings';

export default function AdminPage() {
  const { currentUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('products');

  const tabs = [
    { id: 'products' as TabType, label: 'Productos', icon: Package },
    { id: 'inventory' as TabType, label: 'Inventario', icon: TrendingUp },
    { id: 'reports' as TabType, label: 'Reportes', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-600">
                Administrador: <span className="font-medium">{currentUser?.username}</span>
              </p>
            </div>

            <button
              onClick={logout}
              className="btn btn-secondary flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-10">
        <div className="max-w-screen-2xl mx-auto px-4">
          <nav className="flex gap-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="max-w-screen-2xl mx-auto p-6">
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'reports' && <ReportsManager />}
        {activeTab === 'settings' && <SettingsManager />}
      </main>
    </div>
  );
}
