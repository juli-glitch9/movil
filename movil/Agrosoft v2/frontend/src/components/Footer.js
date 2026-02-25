import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import './Footer.css'; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section about-us">
            <h4>Acerca de nosotros</h4>
            <p>
              Somos un aplicativo web que tiene como objetivo mejorar la
              comercialización de productos agrícolas, mejorando la competitividad en el
              mercado de los pequeños y medianos productores campesinos de Colombia.
            </p>
          </div>
          <div className="footer-section contact-info">
            <h4>¿Quieres vender tus productos?</h4>
            <div className="contact-item">
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Agrosoft@gmail.com</span>
            </div>
            <div className="contact-item">
              <FontAwesomeIcon icon={faPhone} />
              <span>+57 123 525 676</span>
            </div>
          </div>
          <div className="footer-section social-media">
            <h4>Redes sociales</h4>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faWhatsapp} />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <hr className="footer-divider" />
          <p>© 2025 Agrosoft | Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;