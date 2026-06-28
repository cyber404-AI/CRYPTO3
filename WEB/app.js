/*
=============================================================================


(function decryptHandshake() {
    const cipher = [
        0x23, 0x36, 0x37, 0x3c, 0x23, 0x09, 0x08, 0x36, 
        0x27, 0x3c, 0x37, 0x3d, 0x24, 0x13, 0x24, 0x24, 
        0x2d, 0x1e, 0x66, 0x79, 0x7d, 0x78, 0x1c
    ];
    const key = "aether_secret_key_2026";
    let KEY = "";
    for (let i = 0; i < cipher.length; i++) {
        KEY += String.fromCharCode(cipher[i] ^ key.charCodeAt(i % key.length));
    }
    console.log("%c[+] SECURITY BYPASS GRANTED", "color: #00f2fe; font-weight: bold; font-size: 14px;");
    console.log("%cKEY: " + KEY, "color: #f355da; font-weight: bold; font-size: 16px; text-shadow: 0 0 8px #f355da;");
})();
=============================================================================
*/

// --- Product Database ---
const products = [
  {
    id: "aether-band",
    title: "Aether Band V1",
    category: "wearables",
    price: 129.00,
    badge: "Hot",
    image: "assets/aether_band.png",
    description: "Experience the next level of biometric synchronization. The Aether Band V1 tracks neural stress indices, blood oxygenation levels, and features an adaptive neon LED status bar that connects seamlessly to your smart HUD system. Built with premium titanium-infused weave bands."
  },
  {
    id: "kinesis-chrono",
    title: "Kinesis Chronograph",
    category: "watches",
    price: 299.00,
    badge: "Limited",
    image: "assets/kinesis_watch.png",
    description: "A mechanical masterpiece designed for the cybernetic era. The Kinesis Chronograph uses the natural motion of your wrist to wind its sophisticated self-winding mechanisms. Visible through a double-curved sapphire display, it glows under deep UV wavelengths."
  },
  {
    id: "cyberdeck-caps",
    title: "Cyberdeck Keycaps",
    category: "accessories",
    price: 59.00,
    badge: "Sale",
    image: "assets/keycaps.png",
    description: "Upgrade your terminal hardware. These double-shot PBT keycaps feature fully translucent cyberpunk sublegends that amplify mechanical keyboard RGB backlighting. Formatted for Cherry MX switches and standard layouts."
  },
  {
    id: "vapor-visor",
    title: "Vapor HUD Visor",
    category: "wearables",
    price: 349.00,
    badge: "Popular",
    image: "assets/vapor_visor.png",
    description: "Augment your field of view with the Vapor HUD Visor. Offering crystal-clear dual 4K micro-OLED projection lenses, smart situational mapping, real-time translating overlays, and ambient active noise cancellation dials on the frame."
  },
  {
    id: "neural-link",
    title: "Neural Link Interface",
    category: "tech",
    price: 499.00,
    badge: "Elite",
    image: "assets/neural_link.png",
    description: "A consumer-ready electroencephalogram (EEG) device designed to interpret neural signals for hands-free computer controls. Using dry-comb sensors, it operates on a secure ultra-low latency wireless signal. Perfect for advanced builders."
  },
  {
    id: "spectrum-mouse",
    title: "Spectrum Modular Mouse",
    category: "accessories",
    price: 89.00,
    badge: "New",
    image: "assets/spectrum_mouse.png",
    description: "Zero drag, maximum response. The Spectrum mouse features a modular honeycomb chassis, an advanced 26,000 DPI optical sensor, hot-swappable switches, and programmable neon side rails for visual customization."
  }
];

// --- Application State ---
let cart = [];

// --- DOM Cache Elements ---
const productsGrid = document.getElementById("products-grid");
const categoryButtons = document.querySelectorAll(".category-btn");
const cartDrawer = document.getElementById("cart-drawer");
const closeCartBtn = document.getElementById("close-cart-btn");
const cartToggleBtn = document.getElementById("cart-toggle-btn");
const cartItemsContainer = document.getElementById("cart-items");
const cartCountBadge = document.getElementById("cart-count");
const cartTotalVal = document.getElementById("cart-total-val");
const checkoutBtn = document.getElementById("checkout-btn");

// Modal Elements
const modalOverlay = document.getElementById("modal-overlay");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalImg = document.getElementById("modal-img");
const modalCategory = document.getElementById("modal-category");
const modalTitle = document.getElementById("modal-title");
const modalPrice = document.getElementById("modal-price");
const modalDesc = document.getElementById("modal-desc");
const modalAddBtn = document.getElementById("modal-add-btn");

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  // Load saved cart
  const savedCart = localStorage.getItem("aether_cart");
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCartUI();
    } catch (e) {
      cart = [];
    }
  }

  renderProducts("all");
  setupEventListeners();

  // Console welcome message containing developer hints
  console.log(
    "%cAETHER Cybernetic Systems v2.4.0-Alpha\n%cLooking for vulnerability FLAGs? ",
    "color: #00f2fe; font-size: 16px; font-weight: bold; font-family: sans-serif;",
    "color: #94a3b8; font-size: 12px; font-style: italic; font-family: sans-serif;"
  );
});

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Category Filter Toggle
  categoryButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-category");
      renderProducts(category);
    });
  });

  // Cart Drawer open/close
  cartToggleBtn.addEventListener("click", () => {
    cartDrawer.classList.add("open");
  });

  closeCartBtn.addEventListener("click", () => {
    cartDrawer.classList.remove("open");
  });

  // Close modal when overlay clicked
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeProductModal();
    }
  });

  closeModalBtn.addEventListener("click", closeProductModal);

  // Checkout simulation
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Your cart is currently empty.");
      return;
    }
    alert("ORDER SIMULATED\nThank you for exploring AETHER. Security check passed successfully.");
    cart = [];
    saveCart();
    updateCartUI();
    cartDrawer.classList.remove("open");
  });
}

// --- Render Functions ---
function renderProducts(filterCategory) {
  productsGrid.innerHTML = "";

  const filtered = filterCategory === "all"
    ? products
    : products.filter(p => p.category === filterCategory);

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    let badgeHTML = p.badge ? `<span class="product-badge">${p.badge}</span>` : "";

    card.innerHTML = `
      ${badgeHTML}
      <div class="product-image-container" onclick="openProductModal('${p.id}')" style="cursor: pointer;">
        <img class="product-image" src="${p.image}" alt="${p.title}" onerror="this.src='https://placehold.co/600x400/12121a/00f2fe?text=${encodeURIComponent(p.title)}'">
      </div>
      <div class="product-details">
        <span class="product-category">${p.category}</span>
        <h3 class="product-title" onclick="openProductModal('${p.id}')" style="cursor: pointer;">${p.title}</h3>
        <div class="product-bottom">
          <span class="product-price">$${p.price.toFixed(2)}</span>
          <button class="add-to-cart-btn" onclick="addToCart('${p.id}')" aria-label="Add to cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// --- Cart Actions ---
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();

  // Slide open the cart drawer to show the item was added
  cartDrawer.classList.add("open");
}

function updateQuantity(productId, amount) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;

  item.quantity += amount;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("aether_cart", JSON.stringify(cart));
}

function updateCartUI() {
  // Count items
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountBadge.textContent = totalCount;

  // Render Cart list
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" style="margin-bottom: 16px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p>Your cart is empty</p>
      </div>
    `;
    cartTotalVal.textContent = "$0.00";
    return;
  }

  cartItemsContainer.innerHTML = "";
  let totalSum = 0;

  cart.forEach(item => {
    totalSum += item.price * item.quantity;
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `
      <img class="cart-item-img" src="${item.image}" alt="${item.title}" onerror="this.src='https://placehold.co/100x100/12121a/00f2fe?text=${encodeURIComponent(item.title)}'">
      <div class="cart-item-info">
        <div>
          <h4 class="cart-item-title">${item.title}</h4>
          <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
        <div class="cart-item-actions">
          <div class="cart-qty-control">
            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
          </div>
          <button class="remove-item-btn" onclick="removeFromCart('${item.id}')" aria-label="Remove item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(itemEl);
  });

  cartTotalVal.textContent = `$${totalSum.toFixed(2)}`;
}

// --- Product Modal Controls ---
function openProductModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  modalImg.src = product.image;
  // Fallback for missing image
  modalImg.onerror = () => {
    modalImg.src = `https://placehold.co/600x400/12121a/00f2fe?text=${encodeURIComponent(product.title)}`;
  };
  modalCategory.textContent = product.category;
  modalTitle.textContent = product.title;
  modalPrice.textContent = `$${product.price.toFixed(2)}`;
  modalDesc.textContent = product.description;

  // Set click action for Add to Cart inside modal
  modalAddBtn.onclick = () => {
    addToCart(product.id);
    closeProductModal();
  };

  modalOverlay.classList.add("open");
  document.body.style.overflow = "hidden"; // disable background scrolling
}

function closeProductModal() {
  modalOverlay.classList.remove("open");
  document.body.style.overflow = ""; // enable scrolling
}
