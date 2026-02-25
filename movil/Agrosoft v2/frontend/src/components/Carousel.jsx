import React from 'react';
import '../style/carousel.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Image from '../assets/img/farmers-4897451_1280.jpg';
import Imagen2 from '../assets/img/pexels-pixabay-235925.jpg'
import Imagen3 from '../assets/img/salt-harvesting-3060093_1280.jpg'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../style/carousel.css';
export default function Carousel() {
  return (
  
    <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img src={Image} className="d-block w-100" alt=""/>
        </div>
        <div className="carousel-item">
          <img src={Imagen2} className="d-block w-100" alt=""/>
        </div>
        <div className="carousel-item">
          <img src={Imagen3} className="d-block w-100" alt=""/>
        </div>
      </div>
      <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}