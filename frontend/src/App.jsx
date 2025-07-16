import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import WordCloud from './components/wordcloud';
import SendResponses from './components/sendresponses';
import AdminPanel from './components/questions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SendResponses />} />
        <Route path="/display" element={<WordCloud />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
