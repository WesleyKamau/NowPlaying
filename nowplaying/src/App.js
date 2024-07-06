import React, { useState, useEffect, useRef } from 'react';
import Record from './Record';
import './tailwind.css';
import './App.css'; // Ensure to import the CSS file for full screen background

const App = () => {
  const [coverArtUrl, setCoverArtUrl] = useState(null);
  const [secondCoverArtUrl, setSecondCoverArtUrl] = useState(null); // Add a new state variable [1/2]
  const [isVisible, setIsVisible] = useState(false);
  const [useFirstCoverArt, setUseFirstCoverArt] = useState(true); // Add a new state variable [2/2]
  const vantaRef = useRef(null);

  const fetchLatestSong = () => {
    fetch('http://127.0.0.1:5000/latest_song')
      .then((response) => response.json())
      .then((data) => {
        if (data !== null) {
          setIsVisible(true);
          if(coverArtUrl === null) {
            setUseFirstCoverArt(true);
            setCoverArtUrl(data.cover_art_url);
          } else {
            if(useFirstCoverArt) {
              if(coverArtUrl !== data.cover_art_url) {
                setUseFirstCoverArt(false);
                setSecondCoverArtUrl(data.cover_art_url);
              }
            } else {
              if(secondCoverArtUrl !== data.cover_art_url) {
                setUseFirstCoverArt(true);
                setCoverArtUrl(data.cover_art_url);
              }
            }
          }
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
    fetchLatestSong();
    const interval = setInterval(fetchLatestSong, 5000);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js';
    script.async = true;
    script.onload = loadVanta;
    document.body.appendChild(script);

    return () => {
      if (vantaRef.current && vantaRef.current.vantaEffect) {
        vantaRef.current.vantaEffect.destroy();
      }
      clearInterval(interval);
    };
  }, []);

  return (
    <div ref={vantaRef} className="vanta-container">
      <Record coverArtUrl={coverArtUrl} isVisible={isVisible && useFirstCoverArt} />
      <Record coverArtUrl={secondCoverArtUrl} isVisible={isVisible && !useFirstCoverArt} />
    </div>
  );
};

export default App;
