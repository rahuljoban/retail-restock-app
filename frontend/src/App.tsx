import { useState } from 'react';
import ItemsList from './components/ItemsList';
import AddItemForm from './components/AddItemForm';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleItemAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <AddItemForm onItemAdded={handleItemAdded} />
        <ItemsList key={refreshKey} />
      </div>
    </div>
  );
}

export default App;