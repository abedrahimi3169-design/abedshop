// آبجکت مدیریت هماهنگ سه صفحه (SPA Router Engine)
const appPages = {
  home: document.getElementById("page-home"),
  categories: document.getElementById("page-categories"),
  checkout: document.getElementById("page-checkout")
};

const appRoutesLinks = {
  home: document.getElementById("link-home"),
  categories: document.getElementById("link-categories"),
  checkout: document.getElementById("link-checkout")
};

// دریافت المان‌های کانتینر فیلترینگ و نمایش محصولات
const featuredProductsContainer = document.getElementById("featuredProductsContainer");
const categoryProductsContainer = document.getElementById("categoryProductsContainer");
const categoryTabsWrapper = document.getElementById("categoryTabsWrapper");
const headerSearchInput = document.getElementById("headerSearchInput");
const clearSearchBtn = document.getElementById("clearSearch");
const catalogSortEngine = document.getElementById("catalogSortEngine");
const catalogEmptyState = document.getElementById("catalogEmptyState");
const currentActiveCatName = document.getElementById("currentActiveCatName");

// اجزای تعاملی فرانت‌اند
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const cartToggle = document.getElementById("cartToggle");
const closeCartDrawerBtn = document.getElementById("closeCartDrawerBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartDrawerContainer = document.getElementById("cartDrawerContainer");
const cartCount = document.getElementById("cartCount");
const drawerCartTotal = document.getElementById("drawerCartTotal");
const globalBackdrop = document.getElementById("globalBackdrop");
const pageLoaderBar = document.getElementById("pageLoaderBar");

// وضعیت اولیه استیت ماشین برنامه
let globalCartStorage = JSON.parse(localStorage.getItem("ux_luxury_cart")) || [];
let activeCategoryFilter = "all";
let activeDiscountPercent = 0;

// سیستم سوئیچینگ صفحات همراه با انیمیشن پیشرفت بارگذاری
function navigateTo(pageTarget, event = null) {
  if (event) event.preventDefault();

  // فایر کردن انیمیشن لودر بالای صفحه جهت حس حرفه‌ای بودن
  if (pageLoaderBar) {
    pageLoaderBar.style.width = "40%";
    setTimeout(() => { pageLoaderBar.style.width = "85%"; }, 150);
  }

  setTimeout(() => {
    Object.keys(appPages).forEach(key => {
      if (appPages[key]) appPages[key].classList.remove("active");
      if (appRoutesLinks[key]) appRoutesLinks[key].classList.remove("active");
    });

    if (appPages[pageTarget]) appPages[pageTarget].classList.add("active");
    if (appRoutesLinks[pageTarget]) appRoutesLinks[pageTarget].classList.add("active");
    
    if (pageLoaderBar) pageLoaderBar.style.width = "100%";
    if (navMenu) navMenu.classList.remove("open");
    
    window.scrollTo({ top: 0, behavior: "smooth" });

    // ریست خودکار نوار بارگذاری بعد از پایان اتمام فرآیند روتینگ
    setTimeout(() => { if (pageLoaderBar) pageLoaderBar.style.width = "0%"; }, 300);

    if (pageTarget === "checkout") {
      renderInvoiceTable();
    }
  }, 200);
}

// فرمت دهی پولی فاکتورها به تومان
function formatCurrencyIranian(value) {
  return value.toLocaleString("fa-IR") + " تومان";
}

// رندر محصولات بزرگ و شاخص نمونه کاتالوگ در صفحه اصلی
function renderHomeFeaturedGadgets() {
  if (!featuredProductsContainer) return;
  
  // فیلتر کردن ۳ محصول نمونه اول به عنوان محصولات ویژه خانه
  const targetedFeatured = products.filter(item => item.featured).slice(0, 3);
  
  featuredProductsContainer.innerHTML = targetedFeatured.map(gadget => `
    <article class="product-card-luxury">
      <div class="img-zoom-container">
        <img class="card-lazy-image" src="${gadget.images ? gadget.images[0] : gadget.image}" alt="${gadget.name}">
        <span class="card-floating-badge">${gadget.badge || "ویژه"}</span>
      </div>
      <div class="card-ux-body">
        <span class="card-category-indicator">🏷️ ${gadget.category}</span>
        <h3 class="card-main-title">${gadget.name}</h3>
        <p class="card-short-desc">${gadget.description}</p>
        <div class="card-pricing-row">
          <div class="card-price-display">${formatCurrencyIranian(gadget.price)}</div>
          <div class="card-rating-star">★ ${gadget.rating || "۴.۸"}</div>
        </div>
        <button class="card-action-footer-btn" onclick="addGadgetToCart(${gadget.id})">🛒 افزودن سریع به سبد خرید</button>
      </div>
    </article>
  `).join("");
}

// راه‌اندازی منوی دسته‌بندی‌های صفحه ۲ کاتالوگ
function initCategoryTabsCatalog() {
  if (!categoryTabsWrapper) return;
  
  const extractedCategories = [...new Set(products.map(item => item.category))];
  
  let tabsStructure = `<div class="interactive-tab-pill active" id="pill-all" onclick="switchCategoryCatalog('all')">🔥 همه کالاها</div>`;
  
  tabsStructure += extractedCategories.map(categoryItem => `
    <div class="interactive-tab-pill" id="pill-${categoryItem.replace(/\s+/g, '-')}" onclick="switchCategoryCatalog('${categoryItem}')">⚡ ${categoryItem}</div>
  `).join("");
  
  categoryTabsWrapper.innerHTML = tabsStructure;
}

function switchCategoryCatalog(selectedCat) {
  activeCategoryFilter = selectedCat;
  document.querySelectorAll(".interactive-tab-pill").forEach(pill => pill.classList.remove("active"));
  
  const sanitizedId = selectedCat.replace(/\s+/g, '-');
  const targetPill = document.getElementById(`pill-${sanitizedId}`);
  if (targetPill) targetPill.classList.add("active");
  
  if (currentActiveCatName) currentActiveCatName.innerText = selectedCat === "all" ? "همه دسته‌ها" : selectedCat;
  
  renderCategoryProductsCatalog();
}

// رندر پیشرفته گرید دسته‌بندی‌ها (نمایش ردیف‌های ۲ تایی در گوشی موبایل)
function renderCategoryProductsCatalog() {
  if (!categoryProductsContainer) return;
  let dynamicFilteredList = [...products];

  // اعمال فیلتر دسته برگزیده
  if (activeCategoryFilter !== "all") {
    dynamicFilteredList = dynamicFilteredList.filter(item => item.category === activeCategoryFilter);
  }

  // فیلتر متصل به ذره‌بین بالای صفحه اصلی
  const searchInputString = headerSearchInput ? headerSearchInput.value.trim().toLowerCase() : "";
  if (searchInputString) {
    if (clearSearchBtn) clearSearchBtn.style.display = "block";
    dynamicFilteredList = dynamicFilteredList.filter(item => 
      item.name.toLowerCase().includes(searchInputString) || 
      item.description.toLowerCase().includes(searchInputString)
    );
  } else {
    if (clearSearchBtn) clearSearchBtn.style.display = "none";
  }

  // موتور مرتب‌سازی قیمتی بر اساس انتخاب فیلتر
  const activeSortRule = catalogSortEngine ? catalogSortEngine.value : "default";
  if (activeSortRule === "low-to-high") {
    dynamicFilteredList.sort((x, y) => x.price - y.price);
  } else if (activeSortRule === "high-to-low") {
    dynamicFilteredList.sort((x, y) => y.price - x.price);
  }

  // مدیریت وضعیت خالی بودن نتایج جستجو
  if (catalogEmptyState) {
    catalogEmptyState.hidden = dynamicFilteredList.length !== 0;
  }

  // تزریق به گرید محصولات دسته‌بندی
  categoryProductsContainer.innerHTML = dynamicFilteredList.map(gadget => `
    <article class="product-card-luxury">
      <div class="img-zoom-container">
        <img class="card-lazy-image" src="${gadget.images ? gadget.images[0] : gadget.image}" alt="${gadget.name}">
      </div>
      <div class="card-ux-body">
        <h3 class="card-main-title">${gadget.name}</h3>
        <p class="card-short-desc">${gadget.description}</p>
        <div class="card-pricing-row">
          <div class="card-price-display">${formatCurrencyIranian(gadget.price)}</div>
        </div>
        <button class="card-action-footer-btn" onclick="addGadgetToCart(${gadget.id})">🛒 افزودن به سبد</button>
      </div>
    </article>
  `).join("");
}

// پیوند فید ورودی ذره‌بین به سیستم فیلترینگ آنی
if (headerSearchInput) {
  headerSearchInput.addEventListener("input", () => {
    // اگر کاربر در صفحه اصلی باشد، هنگام تایپ کلمات به صفحه دسته‌بندی هدایت می‌شود
    if (!appPages.categories.classList.contains("active")) {
      navigateTo("categories");
    }
    renderCategoryProductsCatalog();
  });
}

if (clearSearchBtn) {
  clearSearchBtn.addEventListener("click", () => {
    headerSearchInput.value = "";
    renderCategoryProductsCatalog();
  });
}

// ذخیره‌سازی داده‌های سبد خرید در کش محلی
function syncCartLocalStorage() {
  localStorage.setItem("ux_luxury_cart", JSON.stringify(globalCartStorage));
}

function addGadgetToCart(id) {
  const matchingProduct = products.find(p => p.id === id);
  if (!matchingProduct) return;
  
  const alreadyInCart = globalCartStorage.find(item => item.id === id);
  if (alreadyInCart) {
    alreadyInCart.quantity++;
  } else {
    globalCartStorage.push({ ...matchingProduct, quantity: 1 });
  }
  
  syncCartLocalStorage();
  syncUIDrawerCart();
  fireUxToastNotification("🛒 محصول با موفقیت به سبد خرید الحاق گردید.");
}

function alterCartItemQty(id, modifier) {
  const targetedItem = globalCartStorage.find(item => item.id === id);
  if (!targetedItem) return;
  
  targetedItem.quantity += modifier;
  if (targetedItem.quantity <= 0) {
    globalCartStorage = globalCartStorage.filter(item => item.id !== id);
  }
  
  syncCartLocalStorage();
  syncUIDrawerCart();
  if (appPages.checkout.classList.contains("active")) renderInvoiceTable();
}

function removeCartItemCompletely(id) {
  globalCartStorage = globalCartStorage.filter(item => item.id !== id);
  syncCartLocalStorage();
  syncUIDrawerCart();
  if (appPages.checkout.classList.contains("active")) renderInvoiceTable();
  fireUxToastNotification("❌ کالا از سبد خرید شما حذف شد.");
}

// به‌روزرسانی دراور سبد خرید کشویی
function syncUIDrawerCart() {
  if (!cartDrawerContainer) return;
  
  if (globalCartStorage.length === 0) {
    cartDrawerContainer.innerHTML = `<p style="color:var(--color-muted); text-align:center; padding:30px; font-size:13px;">محتوای سبد خرید شما خالی است.</p>`;
  } else {
    cartDrawerContainer.innerHTML = globalCartStorage.map(item => `
      <div class="drawer-item-card">
        <img src="${item.images ? item.images[0] : item.image}" alt="${item.name}">
        <div style="flex-grow:1;">
          <div style="font-size:13px; font-weight:700; color:#fff;">${item.name}</div>
          <div class="qty-stepper-control">
            <button class="qty-stepper-btn" onclick="alterCartItemQty(${item.id}, -1)">-</button>
            <span class="qty-stepper-val">${item.quantity}</span>
            <button class="qty-stepper-btn" onclick="alterCartItemQty(${item.id}, 1)">+</button>
          </div>
          <div style="color:var(--color-gold); font-size:12px; margin-top:4px;">${formatCurrencyIranian(item.price)}</div>
        </div>
        <button class="item-erase-btn" onclick="removeCartItemCompletely(${item.id})">✕ حذف</button>
      </div>
    `).join("");
  }
  
  const netCount = globalCartStorage.reduce((acc, item) => acc + item.quantity, 0);
  const netPriceSum = globalCartStorage.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  if (cartCount) cartCount.textContent = netCount;
  if (drawerCartTotal) drawerCartTotal.textContent = formatCurrencyIranian(netPriceSum);
}

// سیستم محاسبه ماشین حساب مالی و صدور پیش‌فاکتور (صفحه حساب و کتاب)
function renderInvoiceTable() {
  const itemsListingArea = document.getElementById("invoiceItemsListing");
  const finSubtotal = document.getElementById("finSubtotal");
  const finDiscount = document.getElementById("finDiscount");
  const finGrandTotal = document.getElementById("finGrandTotal");
  const couponRowWrapper = document.getElementById("couponRowWrapper");

  if (!itemsListingArea) return;

  if (globalCartStorage.length === 0) {
    itemsListingArea.innerHTML = `<p style="color:var(--color-muted); padding:15px; text-align:center;">هیچ آیتم مؤثری برای محاسبه فاکتور یافت نشد.</p>`;
    if (finSubtotal) finSubtotal.innerText = "۰ تومان";
    if (finGrandTotal) finGrandTotal.innerText = "۰ تومان";
    if (couponRowWrapper) couponRowWrapper.hidden = true;
    return;
  }

  itemsListingArea.innerHTML = globalCartStorage.map(gadget => `
    <div class="calculated-item-row">
      <span>📦 ${gadget.name} (تعداد: ${gadget.quantity})</span>
      <strong>${formatCurrencyIranian(gadget.price * gadget.quantity)}</strong>
    </div>
  `).join("");

  const calculatedSum = globalCartStorage.reduce((acc, current) => acc + (current.price * current.quantity), 0);
  const discountReductionValue = calculatedSum * activeDiscountPercent;
  const ultimatePayableSum = calculatedSum - discountReductionValue;

  if (finSubtotal) finSubtotal.innerText = formatCurrencyIranian(calculatedSum);
  
  if (activeDiscountPercent > 0) {
    if (couponRowWrapper) couponRowWrapper.hidden = false;
    if (finDiscount) finDiscount.innerText = formatCurrencyIranian(discountReductionValue) + ` (${activeDiscountPercent * 100}٪)`;
  } else {
    if (couponRowWrapper) couponRowWrapper.hidden = true;
  }
  
  if (finGrandTotal) finGrandTotal.innerText = formatCurrencyIranian(ultimatePayableSum);
}

// سیستم کدهای تخفیف شبیه‌سازی شده فاکتور مالی
function applyDiscountCoupon() {
  const couponInput = document.getElementById("couponCodeInput");
  if (!couponInput) return;

  const typedCoupon = couponInput.value.trim().toUpperCase();
  if (typedCoupon === "LUXURY" || typedCoupon === "OFF10") {
    activeDiscountPercent = 0.10; // ۱۰ درصد کسر فاکتور
    fireUxToastNotification("🎉 کد تخفیف ۱۰ درصدی با موفقیت روی فاکتور اعمال شد.");
    renderInvoiceTable();
  } else {
    fireUxToastNotification("❌ کد تخفیف وارد شده نامعتبر یا منقضی است.");
  }
}

function handleDrawerCheckoutRedirect() {
  if (globalCartStorage.length === 0) {
    alert("سبد خرید شما فاقد کالا است!");
    return;
  }
  if (cartDrawer && globalBackdrop) {
    cartDrawer.classList.remove("open");
    globalBackdrop.classList.remove("show");
  }
  navigateTo("checkout");
}

function processFormToPayment(e) {
  e.preventDefault();
  if (globalCartStorage.length === 0) {
    alert("پیش فاکتور مالی شما خالی است.");
    return;
  }

  const calculatedSum = globalCartStorage.reduce((acc, current) => acc + (current.price * current.quantity), 0);
  const payableWithDiscount = calculatedSum - (calculatedSum * activeDiscountPercent);

  const paymentModalOverlay = document.getElementById("paymentModalOverlay");
  const terminalAmountText = document.getElementById("terminalAmountText");

  if (terminalAmountText) terminalAmountText.innerText = formatCurrencyIranian(payableWithDiscount);
  if (paymentModalOverlay) paymentModalOverlay.style.display = "flex";
}

// سیستم پاپ آپ توست کامپوننت فرانت‌اند
function fireUxToastNotification(textMessage) {
  const toastWidget = document.getElementById("uxToastNotification");
  if (!toastWidget) return;
  
  toastWidget.textContent = textMessage;
  toastWidget.classList.add("show");
  
  setTimeout(() => {
    toastWidget.classList.remove("show");
  }, 3000);
}

// منطق اجرایی درگاه شبیه‌ساز بانکی شتاب
const paymentModalOverlay = document.getElementById("paymentModalOverlay");
const abortPaymentBtn = document.getElementById("abortPaymentBtn");
const bankCardForm = document.getElementById("bankCardForm");
const terminalProcessingScreen = document.getElementById("terminalProcessingScreen");
const terminalStatusMessage = document.getElementById("terminalStatusMessage");

if (abortPaymentBtn && paymentModalOverlay) {
  abortPaymentBtn.addEventListener("click", () => paymentModalOverlay.style.display = "none");
}

if (bankCardForm) {
  bankCardForm.addEventListener("submit", (event) => {
    event.preventDefault();
    bankCardForm.style.display = "none";
    if (terminalProcessingScreen) terminalProcessingScreen.style.display = "block";
    if (terminalStatusMessage) terminalStatusMessage.innerText = "در حال تراکنش و برقراری ارتباط با شاپرک...";

    setTimeout(() => {
      const randomTraceId = Math.floor(100000 + Math.random() * 900000);
      if (terminalStatusMessage) {
        terminalStatusMessage.innerHTML = `
          <span style="font-size:42px; display:block; margin-bottom:10px;">✅</span>
          <strong style="color:var(--color-gold); font-size:17px;">عملیات حساب و کتاب با موفقیت انجام شد!</strong><br>
          <span style="color:var(--color-muted); font-size:12.5px; display:block; margin-top:6px;">کد پیگیری بانکی شتاب: ${randomTraceId}</span>
        `;
      }
      
      // پاکسازی کامل دیتای مالی بعد از تسویه نهایی
      globalCartStorage = [];
      activeDiscountPercent = 0;
      syncCartLocalStorage();
      syncUIDrawerCart();
      
      setTimeout(() => {
        if (paymentModalOverlay) paymentModalOverlay.style.display = "none";
        bankCardForm.style.display = "flex";
        if (terminalProcessingScreen) terminalProcessingScreen.style.display = "none";
        bankCardForm.reset();
        navigateTo("home");
      }, 4500);
    }, 2500);
  });
}

// تنظیم رویدادهای کلیک منوها و لایه‌های شیشه‌ای بک‌دراپ
if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => navMenu.classList.toggle("open"));
}

if (cartToggle && cartDrawer && globalBackdrop) {
  cartToggle.addEventListener("click", () => {
    cartDrawer.classList.add("open");
    globalBackdrop.classList.add("show");
  });
}

const exitCartInteraction = () => {
  if (cartDrawer) cartDrawer.classList.remove("open");
  if (globalBackdrop) globalBackdrop.classList.remove("show");
};

if (closeCartDrawerBtn) closeCartDrawerBtn.addEventListener("click", exitCartInteraction);
if (globalBackdrop) globalBackdrop.addEventListener("click", exitCartInteraction);
if (catalogSortEngine) catalogSortEngine.addEventListener("change", renderCategoryProductsCatalog);

// فراخوانی متدهای هسته در زمان لود اولیه معماری فرانت‌اند
renderHomeFeaturedGadgets();
initCategoryTabsCatalog();
renderCategoryProductsCatalog();
syncUIDrawerCart();