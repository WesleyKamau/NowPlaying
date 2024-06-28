import React, { forwardRef } from 'react';
import './Record.css';

const Record = forwardRef(({ coverArtUrl, isVisible }, ref) => {
  return (
    <div ref={ref} className={`record-container ${isVisible ? 'visible' : 'hidden'}`}>
      <img
          src={coverArtUrl}
          alt="Album Cover"
          className="center-image rounded-lg z-10"
      />
      <img
        src={`${process.env.PUBLIC_URL}/record.png`}
        alt="Vinyl Record"
        className="spinning-record z-0 "
      />
    </div>
  );
});

export default Record;
