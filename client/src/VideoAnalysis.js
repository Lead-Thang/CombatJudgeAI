import React, { useState } from 'react';
import axios from 'axios';

const VideoAnalysis = () => {
  const [videoPath, setVideoPath] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!videoPath) {
      setError('Please enter a video path');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/analyze', {
        video_path: videoPath
      });
      
      setAnalysisResult(response.data);
    } catch (err) {
      setError('Failed to analyze video: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Ultimate Fighting Judge - Video Analysis</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label>
          Video Path:
          <input
            type="text"
            value={videoPath}
            onChange={(e) => setVideoPath(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="Enter video path (e.g., /path/to/video.mp4)"
          />
        </label>
      </div>

      <button 
        onClick={handleAnalyze} 
        disabled={isLoading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Analyzing...' : 'Analyze Video'}
      </button>

      {error && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#ffe6e6', 
          color: '#cc0000', 
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}

      {analysisResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px' 
        }}>
          <h3>Analysis Results</h3>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Winner:</strong> {analysisResult.winner}
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Fighter A ({analysisResult.fighterA.name})</strong>
            <ul>
              <li>Strikes: {analysisResult.fighterA.strikes}</li>
              <li>Control Time: {analysisResult.fighterA.controlTime} seconds</li>
            </ul>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Fighter B ({analysisResult.fighterB.name})</strong>
            <ul>
              <li>Strikes: {analysisResult.fighterB.strikes}</li>
              <li>Control Time: {analysisResult.fighterB.controlTime} seconds</li>
            </ul>
          </div>
          
          <div>
            <strong>Summary:</strong> {analysisResult.summary}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoAnalysis;