import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import DiagnosticoTerritorial from './components/DiagnosticoTerritorial.jsx';
import './styles/variables.css';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <DiagnosticoTerritorial />
    </div>
  </StrictMode>
);
