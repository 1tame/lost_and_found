// src/components/Footer.js
import React, { useEffect, useState } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import '../Footer.css';

function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false); // Optional: comment this out if you want it to show once only
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`footer-container ${isVisible ? 'visible' : ''}`}>
      <div className="footer-wave-container">
        <svg
          className="footer-wave"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path fill="#2d3748" d="M0,30 C480,120 960,0 1440,80 L1440,100 L0,100 Z" />
        </svg>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section about">
            <h3 className="logo-text">Lost & Found</h3>
            <p>
              Your trusted platform for reuniting people with their belongings.
              We're here to help you find what's lost and return what you've found.
            </p>
          </div>

          <div className="footer-section social">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} Lost & Found | All Rights Reserved
        </div>
      </footer>
    </div>
  );
}

export default Footer;
