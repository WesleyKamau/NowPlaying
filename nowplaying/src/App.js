import React, { useState, useEffect, useRef } from 'react';
import Record from './Record';
import './tailwind.css';


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
          console.log('Cover art URL:', data.cover_art_url);
        } else {
          setIsVisible(false);
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  // Function to load Vanta effect
  const loadVanta = () => {
    if (window.VANTA && window.VANTA.FOG) {
      vantaRef.current.vantaEffect = window.VANTA.FOG({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        highlightColor: 0x5f5f55,
        midtoneColor: 0x4394e1,
        lowlightColor: 0x0,
        baseColor: 0xffffff,
        blurFactor: 0.50,
        speed: 0.90,
        zoom: 2.00
      });
    }
  };

  useEffect(() => {
    fetchLatestSong(); // Initial fetch
    const interval = setInterval(fetchLatestSong, 5000); // Fetch every 5 seconds

    // Load Vanta effect
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js';
    script.async = true;
    script.onload = loadVanta;
    document.body.appendChild(script);

    return () => {
      if (vantaRef.current && vantaRef.current.vantaEffect) {
        vantaRef.current.vantaEffect.destroy();
      }
      clearInterval(interval); // Cleanup interval on unmount
    };
  }, []);

  return (
    <>
      <div className="App min-h-screen flex justify-center items-center">
        <Record coverArtUrl={coverArtUrl} isVisible={isVisible} ref={recordRef} />
      </div>
      <div ref={vantaRef} className="vanta-container" style={{ width: '100%', height: '100vh' }}></div>
    </>
  );
};

export default App;
