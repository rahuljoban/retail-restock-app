import { memo } from 'react';

interface Item {
  id: number;
  name: string;
  sku: string;
  location: string;
  quantity: number;
  floor_capacity: number;
}

interface ItemRowProps {
  item: Item;
  onStock: (id: number, delta: number) => void;
  onDelete: (id: number, name: string) => void;
  onMove: (id: number, direction: 'to_backstock' | 'to_salesfloor') => void;
  stockingId: number | null;
}

function ItemRow({ item, onStock, onDelete, onMove, stockingId }: ItemRowProps) {
  const deficit = item.location === 'sales_floor' 
    ? Math.max(0, item.floor_capacity - item.quantity) 
    : 0;
  const isCritical = deficit >= 5;
  const isWarning = deficit > 0 && deficit < 5;
  const isFull = deficit === 0 && item.location === 'sales_floor';

  let rowClasses = "border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors";
  if (isCritical) rowClasses += " bg-red-900/20";
  else if (isWarning) rowClasses += " bg-yellow-900/20";
  else if (isFull) rowClasses += " bg-green-900/20";

  return (
    <tr className={rowClasses}>
      <td className="px-4 py-3 font-medium">{item.name}</td>
      <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.sku}</td>
      <td className="px-4 py-3 capitalize">{item.location.replace('_', ' ')}</td>
      <td className="px-4 py-3 text-center">
        <span className="font-bold">{item.quantity}</span>
        <span className="text-slate-500 text-xs"> / {item.floor_capacity}</span>
      </td>
      <td className="px-4 py-3 text-center">
        {item.location === 'sales_floor' && (
          <>
            {isCritical && <span className="text-red-400 text-xs font-medium">🚨 Critical</span>}
            {isWarning && <span className="text-yellow-400 text-xs font-medium">⚡ Needs Restock</span>}
            {isFull && <span className="text-green-400 text-xs font-medium">✅ Full</span>}
          </>
        )}
        {item.location === 'back_stock' && (
          <span className="text-slate-500 text-xs">In Back Stock</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <button
            onClick={() => onStock(item.id, -1)}
            disabled={stockingId === item.id || item.quantity <= 0}
            className="w-7 h-7 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold transition-colors"
          >
            −
          </button>
          <button
            onClick={() => onStock(item.id, 1)}
            disabled={stockingId === item.id}
            className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition-colors"
          >
            +
          </button>

          {item.location === 'sales_floor' && (
            <button
              onClick={() => onMove(item.id, 'to_backstock')}
              className="px-2 py-1 bg-yellow-600/70 hover:bg-yellow-700/80 text-white text-xs rounded transition-colors"
              title="Move to Back Stock"
            >
              📦 Back
            </button>
          )}
          {item.location === 'back_stock' && (
            <button
              onClick={() => onMove(item.id, 'to_salesfloor')}
              className="px-2 py-1 bg-green-600/70 hover:bg-green-700/80 text-white text-xs rounded transition-colors"
              title="Move to Sales Floor"
            >
              🏪 Floor
            </button>
          )}

          <button
            onClick={() => onDelete(item.id, item.name)}
            className="w-7 h-7 rounded-full bg-red-900/50 hover:bg-red-800/70 text-red-300 hover:text-red-200 text-xs font-bold transition-colors"
            title="Delete item"
          >
            ✕
          </button>
        </div>
      </td>
    </tr>
  );
}

export default memo(ItemRow);