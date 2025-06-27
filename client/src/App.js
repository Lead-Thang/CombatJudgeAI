import React from 'react';
import VideoAnalysis from './VideoAnalysis';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Ultimate Fighting Judge</h1>
      </header>
      
      <main style={{ padding: '20px' }}>
        <VideoAnalysis />
      </main>
    </div>
  );
}

export default App;