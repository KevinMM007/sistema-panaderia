import { Delete } from 'lucide-react';

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm?: () => void;
  maxLength?: number;
}

export default function NumericKeypad({ 
  value, 
  onChange, 
  onConfirm,
  maxLength = 10 
}: NumericKeypadProps) {
  
  const handleNumberClick = (num: string) => {
    if (value.length >= maxLength) return;
    
    // Evitar múltiples puntos decimales
    if (num === '.' && value.includes('.')) return;
    
    // Evitar punto al inicio
    if (num === '.' && value === '') {
      onChange('0.');
      return;
    }
    
    onChange(value + num);
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '.', '0', 'del'
  ];

  return (
    <div className="space-y-3">
      {/* Display */}
      <div className="bg-gray-100 rounded-lg p-4 text-right">
        <div className="text-3xl font-bold text-gray-900 min-h-[48px] flex items-center justify-end">
          {value || '0'}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => {
              if (btn === 'del') handleDelete();
              else handleNumberClick(btn);
            }}
            className={`
              h-16 rounded-lg font-semibold text-xl transition-all active:scale-95
              ${btn === 'del' 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-white border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              }
            `}
          >
            {btn === 'del' ? <Delete className="w-6 h-6 mx-auto" /> : btn}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={handleClear}
          className="btn btn-secondary h-14"
        >
          Limpiar
        </button>
        {onConfirm && (
          <button
            onClick={onConfirm}
            disabled={!value || value === '0'}
            className="btn btn-primary h-14"
          >
            Confirmar
          </button>
        )}
      </div>
    </div>
  );
}
