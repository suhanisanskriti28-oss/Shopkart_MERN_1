const API = "https://shopkart-mern-1.onrender.com";

export const getProducts = async (search = "", category = "") => {
  let url = `${API}/products`;

  const params = new URLSearchParams();

  if (search) {
    params.append("search", search);
  }

  if (category) {
    params.append("category", category);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
};

export const getProductById = async (id) => {
  const response = await fetch(`${API}/products/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return response.json();
};

export const getWishlist = async () => {
  const response = await fetch(`${API}/wishlist`, {
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Failed to fetch wishlist");
    error.status = response.status;
    throw error;
  }

  return data;
};

export const addToWishlist = async (productId) => {
  const response = await fetch(`${API}/wishlist/${productId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Failed to add to wishlist");
    error.status = response.status;
    throw error;
  }

  return data;
};

export const removeFromWishlist = async (productId) => {
  const response = await fetch(`${API}/wishlist/${productId}`, {
    method: "DELETE",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Failed to remove product");
    error.status = response.status;
    throw error;
  }

  return data;
};

export const logoutCustomer = async () => {
  const response = await fetch(`${API}/customers/logout`, {
    method: "POST",
    credentials: "include"
  });

  return response.json();
};