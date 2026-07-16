import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ItemsList from './components/ItemsList';
import AddItemForm from './components/AddItemForm';
import InventoryReadOnly from './components/InventoryReadOnly';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 p-4">
        <nav className="max-w-4xl mx-auto mb-4 flex gap-4">
          <Link to="/" className="text-blue-600 hover:underline">Full View</Link>
          <Link to="/readonly" className="text-blue-600 hover:underline">Read-Only View</Link>
        </nav>
        <Routes>
          <Route path="/" element={
            <>
              <AddItemForm onItemAdded={() => {}} />
              <ItemsList />
            </>
          } />
          <Route path="/readonly" element={<InventoryReadOnly />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;