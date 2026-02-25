import React from "react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style/Home.css";
import Slideshow from "../components/Slideshow";

const Home = () => {
  return (
    <motion.div 
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="featured text-center">
        <h2 className="section-title-custom">PRODUCTOS DESTACADOS DE LA SEMANA</h2>
      </section>

      <Slideshow />
    </motion.div>
  );
};

export default Home;
