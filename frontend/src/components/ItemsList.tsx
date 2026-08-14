import { useEffect, useState } from 'react';

interface Item {
  id: number;
  name: string;
  sku: string;
  location: string;
  quantity: number;
  floor_capacity: number;
}

export default function ItemsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'sales_floor' | 'back_stock'>('all');
  const [stockingId, setStockingId] = useState<number | null>(null);

  const fetchItems = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items`);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data.items || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch items. Is the backend running?');
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleStock = async (id: number, delta: number) => {
    setStockingId(id);
    try {
      // For simplicity, we'll use the existing stock endpoint with a quantity param
      // If you want to support +/- directly, you could add a new endpoint or modify the existing one
      // For now, we'll call the stock endpoint which increments by 1
      if (delta === 1) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/items/${id}/stock`, {
          method: 'PUT',
        });
        if (!response.ok) throw new Error('Failed to stock item');
        await fetchItems();
      } else if (delta === -1) {
        // Decrement logic — you'd need a new endpoint or modify the existing one
        // For now, we'll show a placeholder
        alert('Decrement functionality coming soon!');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Is the backend running?');
    } finally {
      setStockingId(null);
    }
  };

  const filteredItems = filter === 'all' ? items : items.filter(item => item.location === filter);
  const backstockCount = items.filter(item => item.location === 'back_stock').reduce((sum, i) => sum + i.quantity, 0);
  const salesFloorCount = items.filter(item => item.location === 'sales_floor').reduce((sum, i) => sum + i.quantity, 0);

  if (loading) return <div className="p-4 text-center text-slate-400">Loading inventory...</div>;
  if (error) return <div className="p-4 text-center text-red-400">{error}</div>;
  if (items.length === 0) return <div className="p-4 text-center text-slate-400">No items found.</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">📦 Inventory</h1>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setFilter('sales_floor')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'sales_floor' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Sales Floor ({salesFloorCount})
          </button>
          <button
            onClick={() => setFilter('back_stock')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'back_stock' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Back Stock ({backstockCount})
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50">
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Item</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">SKU</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Location</th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">Qty</th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
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
                  <tr key={item.id} className={rowClasses}>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.sku}</td>
                    <td className="px-4 py-3 capitalize">{item.location.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-center font-bold">
                      {item.quantity}
                      {isCritical && <span className="ml-2 text-red-400 text-xs">⚠️</span>}
                      {isWarning && <span className="ml-2 text-yellow-400 text-xs">⚡</span>}
                      {isFull && <span className="ml-2 text-green-400 text-xs">✅</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStock(item.id, -1)}
                          disabled={stockingId === item.id || item.quantity <= 0}
                          className="w-7 h-7 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold transition-colors"
                        >
                          −
                        </button>
                        <button
                          onClick={() => handleStock(item.id, 1)}
                          disabled={stockingId === item.id}
                          className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}