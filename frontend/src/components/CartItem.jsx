
import { useState } from "react";
import { useCart } from "../context/CartContext";

function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const product = item.product;

  if (!product) return null;

  const changeQuantity = async (newQuantity) => {
    if (newQuantity < 1 || saving) return;

    try {
      setSaving(true);
      setError("");

      await updateQuantity(product._id, newQuantity);
    } catch (err) {
      setError(err.message || "Unable to update quantity");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setError("");

      await removeFromCart(product._id);
    } catch (err) {
      setError(err.message || "Unable to remove product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="cart-item">
      <div className="cart-item-details">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="cart-item-image"
          />
        )}

        <h3>{product.name}</h3>

        <p>
          Price: ₹{product.price.toLocaleString("en-IN")}
        </p>

        <p>
          Item total: ₹
          {(product.price * item.quantity).toLocaleString("en-IN")}
        </p>
      </div>

      <div className="cart-item-actions">
        <button
          type="button"
          onClick={() => changeQuantity(item.quantity - 1)}
          disabled={saving || item.quantity <= 1}
          aria-label={`Decrease quantity of ${product.name}`}
        >
          −
        </button>

        <span>Qty: {item.quantity}</span>

        <button
          type="button"
          onClick={() => changeQuantity(item.quantity + 1)}
          disabled={
            saving ||
            (typeof product.stock === "number" &&
              item.quantity >= product.stock)
          }
          aria-label={`Increase quantity of ${product.name}`}
        >
          +
        </button>

        <button
          type="button"
          onClick={handleRemove}
          disabled={saving}
        >
          Remove
        </button>
      </div>

      {saving && <p>Updating cart...</p>}

      {error && <p role="alert">{error}</p>}
    </article>
  );
}

export default CartItem;
