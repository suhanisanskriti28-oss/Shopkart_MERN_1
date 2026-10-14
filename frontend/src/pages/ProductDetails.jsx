import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProductById } from "../services/api";
import Navbar from "../components/Navbar";


function ProductDetails() {

  const { id } = useParams();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [cartMessage, setCartMessage] = useState("");


  useEffect(() => {

    const fetchProduct = async () => {

      try {

        setLoading(true);
        setError("");

        const data = await getProductById(id);

        setProduct(data.product);

      } catch (error) {

        setError("Unable to load product");

      } finally {

        setLoading(false);

      }
    };


    fetchProduct();

  }, [id]);


  const addToCart = () => {
    setCartMessage("Product added to cart!");
  };


  if (loading) {
    return (
      <div className="state-message">
        Loading product...
      </div>
    );
  }


  if (error) {
    return (
      <div className="state-message error">
        {error}
      </div>
    );
  }


  if (!product) {
    return (
      <div className="state-message">
        Product not found.
      </div>
    );
  }


  return (
    <div className="product-details-page">
      <Navbar />

      <Link
        to="/products"
        className="back-button"
      >
        ← Back to Products
      </Link>


      <div className="product-details-card">

        <img
          src={product.image}
          alt={product.name}
          className="product-details-image"
        />


        <div className="product-details-info">

          <p className="product-category">
            {product.category}
          </p>

          <h1>{product.name}</h1>

          <p className="product-details-description">
            {product.description}
          </p>

          <h2 className="product-price">
            ₹{product.price}
          </h2>

          <p className="product-stock">
            {product.stock > 0
              ? `${product.stock} items available`
              : "Out of stock"}
          </p>


          {product.stock > 0 && (
            <button onClick={addToCart}>
              Add to Cart
            </button>
          )}


          {cartMessage && (
            <p className="success-message">
              {cartMessage}
            </p>
          )}

        </div>

      </div>

    </div>
  );
}


export default ProductDetails;
