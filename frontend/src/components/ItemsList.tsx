import { useEffect, useState } from 'react';
import { memo } from 'react';
import ItemRow from './ItemRow';

interface Item {
  id: number;
  name: string;
  sku: string;
  location: string;
  quantity: number;
  floor_capacity: number;
}

function ItemsList() {
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
    // Optimistic update
    setItems(prevItems => prevItems.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ));

    try {
      let response;
      if (delta === 1) {
        response = await fetch(`${import.meta.env.VITE_API_URL}/items/${id}/stock`, {
          method: 'PUT',
        });
      } else if (delta === -1) {
        response = await fetch(`${import.meta.env.VITE_API_URL}/items/${id}/decrement`, {
          method: 'PUT',
        });
      }
      if (!response?.ok) throw new Error('Failed to update item');
      // Re-fetch to ensure consistency with the server
      await fetchItems();
    } catch (error) {
      // Revert on error
      setItems(prevItems => prevItems.map(item => 
        item.id === id 
          ? { ...item, quantity: item.quantity - delta }
          : item
      ));
      alert('Failed to update item. Is the backend running?');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      await fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Is the backend running?');
    }
  };

  const handleMove = async (id: number, direction: 'to_backstock' | 'to_salesfloor') => {
    try {
      const endpoint = direction === 'to_backstock' 
        ? `${import.meta.env.VITE_API_URL}/items/${id}/move-to-backstock`
        : `${import.meta.env.VITE_API_URL}/items/${id}/move-to-salesfloor`;
      
      const response = await fetch(endpoint, { method: 'PUT' });
      if (!response.ok) throw new Error('Failed to move item');
      await fetchItems();
    } catch (error) {
      console.error('Error moving item:', error);
      alert('Failed to move item. Is the backend running?');
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
                <th className="px-4 py-3 text-center text-slate-400 font-medium">Qty / Cap</th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onStock={handleStock}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  stockingId={stockingId}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default memo(ItemsList);