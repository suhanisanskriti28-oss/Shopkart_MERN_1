import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";


function ProductList() {

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {

    const fetchProducts = async () => {

      try {

        setLoading(true);
        setError("");

        const data = await getProducts(search, category);

        setProducts(data.products);

      } catch (error) {

        setError("Unable to load products");

      } finally {

        setLoading(false);

      }
    };


    fetchProducts();

  }, [search, category]);


  const categories = [
    ...new Set(products.map((product) => product.category))
  ];


  return (
    <div className="products-page">
      <Navbar />

      <div className="products-header">

        <div>
          <h1>ShopKart</h1>
          <p>Browse our products</p>
        </div>

        <Link to="/" className="back-button">
          Back
        </Link>

      </div>


      <div className="filters">

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />


        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >

          <option value="">
            All Categories
          </option>

          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}

        </select>

      </div>


      {loading && (
        <div className="state-message">
          Loading products...
        </div>
      )}


      {error && (
        <div className="state-message error">
          {error}
        </div>
      )}


      {!loading && !error && products.length === 0 && (
        <div className="state-message">
          No products found.
        </div>
      )}


      {!loading && !error && products.length > 0 && (

        <div className="product-grid">

          {products.map((product) => (

            <ProductCard
              key={product._id}
              product={product}
            />

          ))}

        </div>

      )}

    </div>
  );
}


export default ProductList;