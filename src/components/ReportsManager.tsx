import { useState } from 'react';
import { useTodaySales, useQuickStats } from '../hooks/useDatabase';
import { generateCashClosing, getTopSellingProducts } from '../db/sales';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Calendar,
  Download,
  Clock
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../utils/format';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

export default function ReportsManager() {
  const todaySales = useTodaySales();
  const stats = useQuickStats();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [cashClosing, setCashClosing] = useState<any>(null);

  const handleGenerateCashClosing = async () => {
    setLoading(true);
    try {
      const closing = await generateCashClosing();
      setCashClosing(closing);
      setAlert({ type: 'success', message: 'Corte de caja generado' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al generar corte de caja' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!cashClosing) return;

    const reportText = `
CORTE DE CAJA
Fecha: ${formatDate(cashClosing.date)}

RESUMEN
----------------------------------------
Total de Ventas: ${cashClosing.salesCount}
Total en Efectivo: ${formatCurrency(cashClosing.totalAmount)}

PRODUCTOS MÁS VENDIDOS
----------------------------------------
${cashClosing.topProducts.map((p: any, i: number) => 
  `${i + 1}. ${p.productName}\n   Cantidad: ${p.quantity} | Ingresos: ${formatCurrency(p.revenue)}`
).join('\n')}

VENTAS POR HORA
----------------------------------------
${cashClosing.salesByHour
  .filter((h: any) => h.sales > 0)
  .map((h: any) => 
    `${h.hour.toString().padStart(2, '0')}:00 - ${h.sales} ventas - ${formatCurrency(h.amount)}`
  ).join('\n')}
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `corte-caja-${formatDate(cashClosing.date)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
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

      <h2 className="text-2xl font-bold mb-6">Reportes y Análisis</h2>

      {/* Estadísticas del Día */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ventas Hoy</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.todayRevenue)}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  {stats.todaySalesCount} transacciones
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Productos Vendidos</p>
                <p className="text-3xl font-bold text-gray-900">
                  {todaySales.reduce((sum, sale) => 
                    sum + sale.items.reduce((s, item) => s + item.quantity, 0), 0
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-2">piezas hoy</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ticket Promedio</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.todaySalesCount > 0
                    ? formatCurrency(stats.todayRevenue / stats.todaySalesCount)
                    : formatCurrency(0)}
                </p>
                <p className="text-sm text-gray-500 mt-2">por venta</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Stock Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStock}</p>
                <p className="text-sm text-gray-500 mt-2">piezas disponibles</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corte de Caja */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Corte de Caja
            </h3>
            <p className="text-gray-600 mb-4">
              Genera un resumen completo de las ventas del día para realizar el cierre de caja.
            </p>
            <button 
              onClick={handleGenerateCashClosing}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Generar Corte de Caja'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">Últimas Ventas</h3>
            {todaySales.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No hay ventas registradas hoy
              </p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {todaySales.slice(0, 5).reverse().map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-sm">{sale.cashierName}</p>
                      <p className="text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatTime(sale.timestamp)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">
                        {formatCurrency(sale.total)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sale.items.reduce((sum, item) => sum + item.quantity, 0)} pzs
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resultado del Corte de Caja */}
      {cashClosing && (
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Corte de Caja - {formatDate(cashClosing.date)}</h3>
              <button 
                onClick={handleDownloadReport}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-600 mb-1">Total del Día</p>
                <p className="text-3xl font-bold text-green-700">
                  {formatCurrency(cashClosing.totalAmount)}
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-600 mb-1">Total de Ventas</p>
                <p className="text-3xl font-bold text-blue-700">
                  {cashClosing.salesCount}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-600 mb-1">Ticket Promedio</p>
                <p className="text-3xl font-bold text-purple-700">
                  {formatCurrency(cashClosing.totalAmount / cashClosing.salesCount)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Productos */}
              <div>
                <h4 className="font-semibold mb-3">Productos Más Vendidos</h4>
                <div className="space-y-2">
                  {cashClosing.topProducts.map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{product.productName}</p>
                          <p className="text-sm text-gray-600">{product.quantity} piezas</p>
                        </div>
                      </div>
                      <p className="font-bold text-primary-600">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ventas por Hora */}
              <div>
                <h4 className="font-semibold mb-3">Ventas por Hora</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {cashClosing.salesByHour
                    .filter((hour: any) => hour.sales > 0)
                    .map((hour: any) => (
                      <div key={hour.hour} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {hour.hour.toString().padStart(2, '0')}:00
                            </p>
                            <p className="text-sm text-gray-600">{hour.sales} ventas</p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900">
                          {formatCurrency(hour.amount)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
