import { useState } from 'react';

interface AddItemFormProps {
  onItemAdded: () => void;
}

export default function AddItemForm({ onItemAdded }: AddItemFormProps) {
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
    const response = await fetch('http://localhost:8000/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        sku,
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
    } else {
      setMessage(`❌ Error: ${data.error || 'Something went wrong'}`);
    }
  } catch (error) {
    setMessage('❌ Failed to add item. Is the backend running?');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., T-Shirt - Black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU *
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., TS-BLK-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sales_floor">Sales Floor</option>
              <option value="back_stock">Back Stock</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor Capacity
            </label>
            <input
              type="number"
              value={floorCapacity}
              onChange={(e) => setFloorCapacity(Number(e.target.value))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300 text-sm font-medium transition-colors"
        >
          {loading ? 'Adding...' : 'Add Item'}
        </button>
        {message && (
          <p className={`text-sm mt-2 ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}