import { BrowserRouter, Route, Routes } from 'react-router-dom';

/** Render the application route tree. */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<main className="min-h-screen bg-slate-50" />} />
      </Routes>
    </BrowserRouter>
  );
}
