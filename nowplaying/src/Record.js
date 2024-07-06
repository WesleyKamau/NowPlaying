import React from 'react';
import './Record.css';

const Record = ({ coverArtUrl, isVisible }) => {
  return (
    <div className={`record-container ${isVisible ? 'slide-in' : 'slide-out'}`}>
      <img
          src={coverArtUrl}
          alt="Album Cover"
          className="center-image rounded-lg z-10"
      />
      <img
        src={`${process.env.PUBLIC_URL}/record.png`}
        alt="Vinyl Record"
        className="spinning-record z-0"
      />
    </div>
  );
};

export default Record;
