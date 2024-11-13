// Banner.js
import React from 'react';
import './Banner.css';

function Banner() {
  return (
    <header className="banner">
      <div className="banner-left">
        <button className="home-button">Home</button>
      </div>
      
      <div className="banner-center">
        <input
          type="text"
          className="search-bar"
          placeholder="Search..."
        />
      </div>

      <div className="banner-right">
        <button className="account-button">Account</button>
      </div>
    </header>
  );
}

export default Banner; // Ensure this is a default export
