import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Residents from './pages/Residents';
import Families from './pages/Families';
import Letters from './pages/Letters';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="residents" element={<Residents />} />
          <Route path="families" element={<Families />} />
          <Route path="letters" element={<Letters />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
