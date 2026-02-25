import React from "react";
import "./Slideshow2.css";
import agriImg from "../assets/cereza.jpg";
import mangoImg from "../assets/mango1.jpg";
import tomaImg from "../assets/pexels-enginakyurt-10112724.jpg";
import pimenImg from "../assets/pexels-jan-van-der-wolf-11680885-30527144.jpg";

const imagesPromo = [
  { img: agriImg, promo: "10% OFF" },
  { img: mangoImg, promo: "20% OFF" },
  { img: tomaImg, promo: "70% OFF" },
  { img: pimenImg, promo: "10% OFF" },
];

const Slideshow2 = () => {
  const imagesLoop = [...imagesPromo, ...imagesPromo];

  return (
    <div className="carousel-container-infinite">
      <div className="carousel-track">
        {imagesLoop.map(({ img, promo }, index) => (
          <div key={index} className="carousel-image-container">
            <img src={img} alt={`Slide ${index + 1}`} className="carousel-image" />
            {promo && <div className="sticker">{promo}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slideshow2;
