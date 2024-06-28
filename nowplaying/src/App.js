import React, { useState, useEffect, useRef } from 'react';
import Record from './Record';
import * as THREE from 'three';


const App = () => {
  const [coverArtUrl, setCoverArtUrl] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const recordRef = useRef(null);
  const vantaRef = useRef(null);

  // Function to fetch latest song data
  const fetchLatestSong = () => {
    fetch('http://127.0.0.1:5000/latest_song')
      .then((response) => response.json())
      .then((data) => {
        if (data !== null) {
          setIsVisible(true);
          setCoverArtUrl(data.cover_art_url);
          console.log('Fetched data:', data);
        } else {
          setIsVisible(false);
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  // Fetch latest song data on initial load and every 5 seconds
  useEffect(() => {
    fetchLatestSong(); // Initial fetch
    const interval = setInterval(fetchLatestSong, 5000); // Fetch every 5 seconds

    const loadVanta = () => {
      if (window.VANTA) {
        window.VANTA.FOG({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          highlightColor: 0xff0077,
          midtoneColor: 0x841e10,
          lowlightColor: 0xff00d1,
        });
      }
    };

    if (window.VANTA) {
      loadVanta();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js';
      script.onload = loadVanta;
      document.body.appendChild(script);
    }

    return () => {
      if (vantaRef.current && vantaRef.current.vantaEffect) {
        vantaRef.current.vantaEffect.destroy();
      }
      clearInterval(interval); // Cleanup interval on unmount
    }
  }, []);

  

  return (
    <>
      <div className="App bg-white min-h-screen flex justify-center items-center">
        <Record coverArtUrl={coverArtUrl} isVisible={isVisible} ref={recordRef} />
      </div>
      <div ref={vantaRef} className="vanta-container"></div>
    </>
  );
};

export default App;
