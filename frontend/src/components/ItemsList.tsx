import { useEffect, useState } from 'react';

interface Item {
  id: number;
  name: string;
  sku: string;
  location: string;
  quantity: number;
  min_threshold: number;
  floor_capacity: number;
}

export default function ItemsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockingId, setStockingId] = useState<number | null>(null);
  const [backstockCount, setBackstockCount] = useState(0);
  const [salesFloorCount, setSalesFloorCount] = useState(0);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:8000/items');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data.items);
      setBackstockCount(data.backstock_count);
      setSalesFloorCount(data.sales_floor_count);
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

  const handleStock = async (id: number) => {
    setStockingId(id);
    try {
      const response = await fetch(`http://localhost:8000/items/${id}/stock`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to stock item');
      await fetchItems();
    } catch (error) {
      console.error('Error stocking item:', error);
      alert('Failed to stock item. Is the backend running?');
    } finally {
      setStockingId(null);
    }
  };

  if (loading) return <div className="p-4">Loading items...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>

      {/* Summary Counts */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Back Stock</p>
          <p className="text-2xl font-bold">{backstockCount}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Sales Floor</p>
          <p className="text-2xl font-bold">{salesFloorCount}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {items.map(item => {
          // Calculate priority: how far below floor_capacity
          const deficit = item.location === 'sales_floor' 
            ? Math.max(0, item.floor_capacity - item.quantity) 
            : 0;
          
          const isCritical = deficit >= 5;
          const isWarning = deficit > 0 && deficit < 5;
          const isFull = deficit === 0 && item.location === 'sales_floor';

          // Determine card border and background
          let cardClasses = "border rounded-lg p-4 shadow-sm transition-all bg-white ";
          if (isCritical) {
            cardClasses += "border-red-500 bg-red-50 border-2";
          } else if (isWarning) {
            cardClasses += "border-yellow-400 bg-yellow-50";
          } else if (isFull) {
            cardClasses += "border-green-400 bg-green-50";
          }

          return (
            <div key={item.id} className={cardClasses}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                  <p className="text-sm">
                    Location: <span className="capitalize">{item.location}</span>
                  </p>
                  {item.location === 'sales_floor' && (
                    <p className="text-xs text-gray-400">
                      Floor Capacity: {item.floor_capacity}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    isCritical ? 'text-red-500' : 
                    isWarning ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {item.quantity}
                  </p>
                  <p className="text-xs text-gray-400">Min Threshold: {item.min_threshold}</p>
                </div>
              </div>
              
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => handleStock(item.id)}
                  disabled={stockingId === item.id}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 text-sm font-medium transition-colors"
                >
                  {stockingId === item.id ? 'Stocking...' : 'Stock It'}
                </button>
                
                {/* Visual Indicators */}
                {item.location === 'sales_floor' && (
                  <>
                    {deficit === 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Full
                      </span>
                    )}
                    {isWarning && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⚠️ Needs Restock ({deficit} below capacity)
                      </span>
                    )}
                    {isCritical && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                        🚨 Critical! ({deficit} below capacity)
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}