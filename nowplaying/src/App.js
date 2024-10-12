import React, { useState, useEffect, useRef } from 'react';
import Record from './Record';
import './tailwind.css';
import './App.css'; // Ensure to import the CSS file for full screen background

const App = () => {
  const [coverArtUrl, setCoverArtUrl] = useState(null);
  const [secondCoverArtUrl, setSecondCoverArtUrl] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [useFirstCoverArt, setUseFirstCoverArt] = useState(true);
  const vantaRef = useRef(null);
  const [highlightColor, setHighlightColor] = useState(0x5f5f55);
  const [midtoneColor, setMidtoneColor] = useState(0x4394e1);
  const [lowlightColor, setLowlightColor] = useState(0x0);

  // Helper function to extract colors from an image using canvas
  const extractColorsFromImage = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Ensures that the image can be used in a canvas
      img.src = imageUrl;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let r = 0, g = 0, b = 0;
        const pixelCount = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        // Calculate the average color
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        const dominantColor = `rgb(${r}, ${g}, ${b})`;
        const lighterColor = `rgb(${Math.min(r + 50, 255)}, ${Math.min(g + 50, 255)}, ${Math.min(b + 50, 255)})`;
        const darkerColor = `rgb(${Math.max(r - 50, 0)}, ${Math.max(g - 50, 0)}, ${Math.max(b - 50, 0)})`;

        resolve({ dominantColor, lighterColor, darkerColor });
      };

      img.onerror = (error) => reject(error);
    });
  };

  const fetchLatestSong = () => {
    fetch('http://127.0.0.1:5000/latest_song')
      .then((response) => response.json())
      .then((data) => {
        if (data !== null) {
          setIsVisible(true);
          if (coverArtUrl === null) {
            setUseFirstCoverArt(true);
            setCoverArtUrl(data.cover_art_url);
          } else {
            if (useFirstCoverArt) {
              if (coverArtUrl !== data.cover_art_url) {
                setUseFirstCoverArt(false);
                setSecondCoverArtUrl(data.cover_art_url);
              }
            } else {
              if (secondCoverArtUrl !== data.cover_art_url) {
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
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: highlightColor,
        midtoneColor: midtoneColor,
        lowlightColor: lowlightColor,
        baseColor: 0xffffff,
        blurFactor: 0.5,
        speed: 0.9,
        zoom: 2.0,
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
  }, [highlightColor, midtoneColor, lowlightColor]);

  // Extract colors from the current cover art
  useEffect(() => {
    if(!isVisible) {
      setHighlightColor(0x5f5f55);
      setMidtoneColor(0x4394e1);
      setLowlightColor(0x0);
      console.log('Default colors set');
    } else {
      const currentCoverArtUrl = useFirstCoverArt ? coverArtUrl : secondCoverArtUrl;

      if (currentCoverArtUrl) {
        extractColorsFromImage(currentCoverArtUrl)
          .then(({ dominantColor, lighterColor, darkerColor }) => {
            setHighlightColor(lighterColor);
            setMidtoneColor(dominantColor);
            setLowlightColor(darkerColor);
          })
          .catch((error) => console.error('Error extracting colors:', error));
      }
    
    }
  }, [coverArtUrl, secondCoverArtUrl,isVisible]);

  return (
    <div ref={vantaRef} className="vanta-container">
      <Record coverArtUrl={coverArtUrl} isVisible={isVisible && useFirstCoverArt} />
      <Record coverArtUrl={secondCoverArtUrl} isVisible={isVisible && !useFirstCoverArt} />
    </div>
  );
};

export default App;
