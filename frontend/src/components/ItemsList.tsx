import { useEffect, useState } from 'react';

interface Item {
  id: number;
  name: string;
  sku: string;
  location: string;
  quantity: number;
  min_threshold: number;
}

export default function ItemsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/items')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setItems(data.items);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch items. Is the backend running?');
        setLoading(false);
        console.error(err);
      });
  }, []);

  if (loading) return <div className="p-4">Loading items...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>
      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                <p className="text-sm">Location: <span className="capitalize">{item.location}</span></p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${item.quantity < item.min_threshold ? 'text-red-500' : 'text-green-600'}`}>
                  {item.quantity}
                </p>
                <p className="text-xs text-gray-400">Threshold: {item.min_threshold}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}