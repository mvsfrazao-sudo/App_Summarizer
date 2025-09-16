import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import HomePage from './components/HomePage';
import SummarizerPage from './components/SummarizerPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/summarize" element={<SummarizerPage />} />
        </Routes>
        <Toaster />
      </Router>
    </div>
  );
}

export default App;