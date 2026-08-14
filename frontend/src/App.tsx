import { useState } from 'react';
import ItemsList from './components/ItemsList';
import AddItemModal from './components/AddItemModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleItemAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            🌱 Rahul's Clothing Store
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            + Add Item
          </button>
        </div>
        <ItemsList key={refreshKey} />
        <AddItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onItemAdded={handleItemAdded}
        />
      </div>
    </div>
  );
}

export default App;