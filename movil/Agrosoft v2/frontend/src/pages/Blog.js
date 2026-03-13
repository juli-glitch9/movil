import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Blog.css";

// --- IMPORTACIÓN DE SWIPER ---
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";

// Estilos de Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import { FaArrowLeft, FaLeaf, FaUsers, FaHandshake, FaStar, FaPhone, FaEnvelope } from "react-icons/fa";

// Activos (Imágenes)
import imgBanner1 from "../assets/cow-7200409_1920.jpg";
import imgBanner2 from "../assets/close-up-soil-sprout.jpg";
import imgBanner3 from "../assets/herd-black-white-cows-grassland.jpg";
import imgBanner4 from "../assets/img3.jpg";
import imgBanner5 from "../assets/cows-203460_1920.jpg";
import acercaImg from "../assets/imgd.jpg";
import metasImg from "../assets/cows-8497701_1920.jpg";

const Blog = () => {
  const navigate = useNavigate();

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">Bienvenido a AgroSoft</h1>
            <p className="hero-subtitle">Conectando agricultores con el mercado digital</p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-numbers">Agricultores</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1000+</span>
                <span className="stat-numbers">Productos</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-numbers">Regiones</span>
              </div>
            </div>
          </div>
        </div>
        <div className="banner">
          <ul>
            <li><img src={imgBanner1} alt="Banner 1" /></li>
            <li><img src={imgBanner2} alt="Banner 2" /></li>
            <li><img src={imgBanner3} alt="Banner 3" /></li>
            <li><img src={imgBanner4} alt="Banner 4" /></li>
            <li><img src={imgBanner5} alt="Banner 5" /></li>
          </ul>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title">Nuestros Servicios</h2>
          <div className="services-grid">
            <div className="service-card">
              <FaLeaf className="service-icon" />
              <h3>Gestión de Inventario</h3>
              <p>Controla tu inventario agrícola de manera eficiente y precisa.</p>
            </div>
            <div className="service-card">
              <FaUsers className="service-icon" />
              <h3>Conexión con Clientes</h3>
              <p>Accede directamente a compradores locales y nacionales.</p>
            </div>
            <div className="service-card">
              <FaHandshake className="service-icon" />
              <h3>Precios Justos</h3>
              <p>Elimina intermediarios y obtén mejores precios por tus productos.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="ofertas-header">
        <h1>Blog - AgroSoft</h1>
        <p>Mejorando la comercialización de productos agrícolas</p>
      </div>

      <main className="contenido-blog-swiper">
        {/* --- CARRUSEL: ACERCA DE NOSOTROS --- */}
        <section className="carrusel-seccion-bloque">
          <Swiper
            modules={[Navigation, Autoplay, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }} // Evita que los textos se encimen
            navigation
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={true}
            className="swiper-acerca"
          >
            <SwiperSlide>
              <div className="slide-content-flex">
                <div className="acerca-texto">
                  <h2>Acerca de nosotros</h2>
                  <p>
                    Estamos detrás del desarrollo de este aplicativo que permite gestionar el inventario y la comercialización de productos agrícolas,
                    mejorando la competitividad en el mercado de pequeños y medianos productores de Colombia.
                  </p>
                </div>
                <div className="image-side">
                  <img src={acercaImg} alt="Acerca 1" />
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="slide-content-flex">
                <div className="acerca-texto">
                  <h2>Nuestra Misión</h2>
                  <p>
                    Aseguramos precios justos y procesos simplificados, transformando la vida de quienes 
                    trabajan la tierra a través de la tecnología digital.
                  </p>
                </div>
                <div className="image-side">
                  <img src={imgBanner2} alt="Misión" />
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </section>

        {/* --- CARRUSEL: METAS --- */}
        <section className="carrusel-seccion-bloque">
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            loop={true}
            className="swiper-metas"
          >
            <SwiperSlide>
              <div className="slide-content-flex reverse">
                <div className="metas-texto">
                  <h2>Metas de Visibilidad</h2>
                  <ul className="lista-metas">
                    <li>Incrementar la visibilidad de los pequeños agricultores.</li>
                    <li>Facilitar procesos de venta y distribución.</li>
                  </ul>
                </div>
                <div className="image-side">
                  <img src={metasImg} alt="Metas 1" />
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="slide-content-flex reverse">
                <div className="metas-texto">
                  <h2>Impacto Social</h2>
                  <ul className="lista-metas">
                    <li>Reducir intermediarios innecesarios.</li>
                    <li>Crear una red sólida de comercio agrícola.</li>
                  </ul>
                </div>
                <div className="image-side">
                  <img src={imgBanner4} alt="Metas 2" />
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </section>
      </main>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">Lo que dicen nuestros agricultores</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
              <p>"AgroSoft ha revolucionado la forma en que vendo mis productos."</p>
              <cite>- María González</cite>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
              <p>"La plataforma es fácil de usar y me ayuda a gestionar mi inventario."</p>
              <cite>- Carlos Rodríguez</cite>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <h2 className="section-title">Contáctanos</h2>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <div><h4>Teléfono</h4><p>+57 300 123 4567</p></div>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <div><h4>Email</h4><p>info@agrosoft.com</p></div>
              </div>
            </div>
            <div className="contact-form">
              <form>
                <div className="form-group"><input type="text" placeholder="Nombre" required /></div>
                <div className="form-group"><input type="email" placeholder="Email" required /></div>
                <div className="form-group"><textarea placeholder="Mensaje" rows="4" required></textarea></div>
                <button type="submit" className="contact-btn">Enviar Mensaje</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="volver-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <button className="contact-btn" style={{ width: 'auto' }} onClick={() => navigate(-1)}>
          <FaArrowLeft style={{ marginRight: '8px' }} />
          Volver
        </button>
      </section>
    </div>
  );
};

export default Blog;