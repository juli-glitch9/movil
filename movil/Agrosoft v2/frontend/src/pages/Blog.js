import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/Blog.css";
import { FaArrowLeft } from "react-icons/fa";


import logo from "../assets/1.PNG";
import imgBanner1 from "../assets/cow-7200409_1920.jpg";
import imgBanner2 from "../assets/close-up-soil-sprout.jpg";
import imgBanner3 from "../assets/herd-black-white-cows-grassland.jpg";
import imgBanner4 from "../assets/img3.jpg";
import imgBanner5 from "../assets/cows-203460_1920.jpg";
import acercaImg from "../assets/imgd.jpg";
import metasImg from "../assets/cows-8497701_1920.jpg";

const Blog = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>



      <div className="ofertas-header">
        <h1>Blog - AgroSoft</h1>
        <p>Mejorando la comercialización de productos agrícolas</p>
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


      <main className="contenido-blog">
        <section className="acerca-metas-contenedor">
          <div className="acerca-img">
            <img src={acercaImg} alt="Agricultor" />
          </div>
          <div className="acerca-texto">
            <h2>Acerca de nosotros</h2>
            <p>
              Estamos detrás del desarrollo de este aplicativo que permite gestionar el inventario y la comercialización de productos agrícolas,
              mejorando la competitividad en el mercado de pequeños y medianos productores de Colombia.
              Aseguramos precios justos y procesos simplificados.
            </p>
          </div>
        </section>

        <section className="acerca-metas-contenedor metas-invertido">
          <div className="metas-texto">
            <h2>Metas</h2>
            <ul className="lista-metas">
              <li>Incrementar la visibilidad de los pequeños agricultores.</li>
              <li>Facilitar procesos de venta y distribución.</li>
              <li>Reducir intermediarios innecesarios.</li>
              <li>Crear una red sólida de comercio agrícola.</li>
            </ul>
          </div>
          <div className="metas-img">
            <img src={metasImg} alt="Cultivo" />
          </div>
        </section>
      </main>


      <section className="volver-container">
        <button onClick={() => navigate(-1)}>
          <FaArrowLeft style={{ marginRight: '8px' }} />
          Volver
        </button>
      </section>


    </>
  );
};

export default Blog;
