import { useState } from 'react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: () => void;
}

export default function AddItemModal({ isOpen, onClose, onItemAdded }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [location, setLocation] = useState('sales_floor');
  const [quantity, setQuantity] = useState(0);
  const [floorCapacity, setFloorCapacity] = useState(10);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          sku: sku.toUpperCase(),
          location,
          quantity: Number(quantity),
          floor_capacity: Number(floorCapacity),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setName('');
        setSku('');
        setQuantity(0);
        setFloorCapacity(10);
        onItemAdded();
        setTimeout(onClose, 1500);
      } else {
        setMessage(`❌ Error: ${data.error || 'Something went wrong'}`);
      }
    } catch (error) {
      setMessage('❌ Failed to add item. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Item</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Item Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="e.g., T-Shirt - Black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">SKU *</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              required
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-mono uppercase"
              placeholder="e.g., TS-BLK-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Location *</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="sales_floor">Sales Floor</option>
              <option value="back_stock">Back Stock</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="0"
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Floor Capacity</label>
            <input
              type="number"
              value={floorCapacity}
              onChange={(e) => setFloorCapacity(Number(e.target.value))}
              min="1"
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Adding...' : 'Add Item'}
          </button>
          {message && (
            <p className={`text-sm text-center ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}