// src/pages/ProductPage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../config/api"; // Importamos la instancia de Axios
import ProductDetail from "../components/ProductDetail";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/api/products/${id}`); // Usamos api en vez de axios directo

        // Dependiendo de tu backend, puede que la data venga dentro de response.data.data
        // Ajusta según tu API
        setProduct(response.data.data || response.data); 
      } catch (err) {
        console.error("Error cargando producto:", err);
        setError("No se pudo cargar el producto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p style={{ padding: "20px" }}>Cargando producto...</p>;
  if (error) return <p style={{ padding: "20px" }}>{error}</p>;

  return (
    <div>
      {product ? (
        <ProductDetail product={product} />
      ) : (
        <p style={{ padding: "20px" }}>Producto no encontrado</p>
      )}
    </div>
  );
};

export default ProductPage;
