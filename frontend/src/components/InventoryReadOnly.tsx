import { useEffect, useState } from 'react';

interface Item {
  id: number;
  name: string;
  sku: string;
  location: string;
  quantity: number;
}

export default function InventoryReadOnly() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/items`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load inventory');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  // Separate backstock and sales floor items
  const backstockItems = items.filter(item => item.location === 'back_stock');
  const salesFloorItems = items.filter(item => item.location === 'sales_floor');

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Inventory Overview</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Total Back Stock</p>
          <p className="text-2xl font-bold">
            {backstockItems.reduce((sum, item) => sum + item.quantity, 0)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Total Sales Floor</p>
          <p className="text-2xl font-bold">
            {salesFloorItems.reduce((sum, item) => sum + item.quantity, 0)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left border-b">Item</th>
              <th className="px-4 py-2 text-left border-b">SKU</th>
              <th className="px-4 py-2 text-center border-b">Back Stock</th>
              <th className="px-4 py-2 text-center border-b">Sales Floor</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{item.name}</td>
                <td className="px-4 py-2 border-b font-mono text-sm">{item.sku}</td>
                <td className="px-4 py-2 border-b text-center">
                  {item.location === 'back_stock' ? item.quantity : 0}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  {item.location === 'sales_floor' ? item.quantity : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}