/* ==========================================================================
   ■ LUXURY GADGET HUB - CORE INTELLIGENCE & STATE ENGINE (VERSION 2026)
   ■ ARCHITECTURE: SPA ROUTER, REAL-TIME FILTER MATRIX, VIP CART, SHETAB SIMULATOR
   ========================================================================== */

// --------------------------------------------------------------------------
// ۰۱. مدیریت وضعیت (GLOBAL STATE MANAGEMENT)
// --------------------------------------------------------------------------
let vipCart = JSON.parse(localStorage.getItem("luxury_vip_cart")) || [];
let currentActiveView = "home";
let activeCategoryFilter = "all";
let qualifiedCompareList = [];
let activeAppliedPromo = null;

// دیتای چت‌باکس هوشمند برای پاسخ‌دهی خودکار تعاملی
const aiChatBotLexicon = {
  "سلام": "سلام خدمت شما کاربر گران‌قدر و VIP. چطور می‌توانم در انتخاب برترین تکنولوژی‌های سال ۲۰۲۶ به شما کمک کنم؟",
  "قیمت": "کلیه قیمت‌های پلتفرم لوکس گجت به صورت لحظه‌ای با متدهای زنجیره تامین جهانی همگام‌سازی شده‌اند و دارای ۶ ماه تضمین ثبات فاکتور هستند.",
  "ارسال": "ارسال مرسولات VIP از طریق ترانزیت هوایی اکسپرس، کاملاً ایزوله و ضدضربه همراه با بیمه کالا تا درب منزل شما انجام می‌شود.",
  "گارانتی": "تمامی گجت‌ها دارای گواهی اصالت بلاکچین و گارانتی تعویض پلاتینیوم ۶ ماهه بدون قید و شرط هستند.",
  "تشکر": "خواهش می‌کنم. رضایت شما، منشور اصلی پلتفرم بین‌المللی لوکس گجت است. ✨"
};

// --------------------------------------------------------------------------
// ۰۲. راه‌انداز اولیه و لیسنرهای اصلی (SYSTEM BOOTSTRAP & LISTENERS)
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // بوت کردن ماژول‌های سیستم
  initializeSpaRouter();
  initResponsiveMenuHub();
  syncCartUiBadges();
  renderFeaturedHomeProducts();
  renderCatalogTabs();
  applyCatalogMatrixRender();
  setupInteractiveFilters();
  runCampaignCountdownTimer();

  // جابجایی افکت شناور تصویر هیرو بنر به صورت تعاملی با ماوس
  const heroAsset = document.getElementById("heroLevitatingAsset");
  if (heroAsset) {
    document.addEventListener("mousemove", (e) => {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 45;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 45;
      heroAsset.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) translateY(-10px)`;
    });
  }
});

// --------------------------------------------------------------------------
// ۰۳. روتر داخلی بدون ریلود (SPA ROUTER ENGINE)
// --------------------------------------------------------------------------
function initializeSpaRouter() {
  // بررسی هش آدرس بار برای لودینگ‌های مستقیم
  const hash = window.location.hash.replace("#/", "");
  if (["home", "catalog", "billing"].includes(hash)) {
    routerNavigate(hash);
  } else {
    routerNavigate("home");
  }

  // شنود کلیدهای عقب و جلوی مرورگر
  window.addEventListener("popstate", (e) => {
    if (e.state && e.state.viewTarget) {
      switchViewDOM(e.state.viewTarget);
    }
  });
}

function routerNavigate(viewId, event = null) {
  if (event) event.preventDefault();
  
  // شبیه‌سازی افکت لودینگ نوار پیشرفت در بالاترین لایه هدر
  const progressBar = document.getElementById("globalPageProgressBar");
  progressBar.style.width = "30%";
  
  setTimeout(() => { progressBar.style.width = "70%"; }, 100);

  setTimeout(() => {
    switchViewDOM(viewId);
    progressBar.style.width = "100%";
    setTimeout(() => { progressBar.style.width = "0%"; }, 300);
    
    // پوش کردن آدرس در هیستوری مرورگر
    window.history.pushState({ viewTarget: viewId }, "", `#/${viewId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 250);
}

function switchViewDOM(viewId) {
  currentActiveView = viewId;
  
  // مدیریت کلاس Active نمایشگرها
  document.querySelectorAll(".spa-view-framework").forEach(view => {
    view.classList.remove("active");
  });
  
  const targetDOM = document.getElementById(`view-${viewId}`);
  if (targetDOM) targetDOM.classList.add("active");

  // بروزرسانی تگ اکتیو منوهای هدر دسکتاپ و موبایل
  document.querySelectorAll(".nav-anchor, .mobile-nav-link").forEach(link => {
    link.classList.remove("active");
  });
  
  const activeAnchor = document.getElementById(`route-${viewId}`);
  if (activeAnchor) activeAnchor.classList.add("active");
  
  const activeMobileAnchor = document.getElementById(`m-route-${viewId}`);
  if (activeMobileAnchor) activeMobileAnchor.classList.add("active");

  // در صورتی که وارد فاکتور نهایی شد، رندر فاکتور صورت گیرد
  if (viewId === "billing") {
    renderInvoiceAuditSheet();
  }
}

// --------------------------------------------------------------------------
// ۰۴. ابزارهای کمکی و فرمت‌دهی مالی (UTILITIES & FORMATTERS)
// --------------------------------------------------------------------------
function formatPriceToPersian(price){
    return price.toLocaleString("fa-IR") + " تومان";
}

function invokeSystemToast(message, type = "gold") {
    const toastDOM = document.getElementById("globalToastNotificationSystem");
    toastDOM.innerText = message;
    toastDOM.className = `luxury-toast-notification active ${type}`;

    setTimeout(() => {
        toastDOM.classList.remove("active");
    }, 4000);
}

function smoothScrollToSection(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

// --------------------------------------------------------------------------
// ۰۵. رندرینگ محصولات (PRODUCT CARDS ARCHITECTURE)
// --------------------------------------------------------------------------
function generateProductCardHtml(product) {
  return `
    <article class="luxury-product-card" data-product-id="${product.id}">
      <div>
        ${product.badge ? `<span class="card-badge-layer">${product.badge}</span>` : ''}
        <div class="card-media-theatre" onclick="openProductDetailVisualizer(${product.id})">
          <img src="${product.images ? product.images[0] : 'assets/images/default.jpg'}" alt="${product.name}" loading="lazy">
        </div>
        <span class="card-meta-category">${product.category}</span>
        <h3 class="card-product-title" onclick="openProductDetailVisualizer(${product.id})">${product.name}</h3>
      </div>
      <div>
        <div class="card-financial-row">
          <span class="card-price-amount">${formatPriceToPersian(product.price)}</span>
          <span class="card-rating-star">★ ${product.rating.toLocaleString("fa-IR")}</span>
        </div>
        <div class="card-action-triggers-hub">
          <button class="card-add-to-cart-trigger" onclick="injectItemToVipCart(${product.id})">🛒 افزودن VIP</button>
          <button class="card-compare-shortcut-trigger" onclick="pushItemToCompareMatrix(${product.id})" title="افزودن به مقایسه فنی">⚖️</button>
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedHomeProducts() {
  const container = document.getElementById("featuredHomeContainer");
  if (!container || typeof products === "undefined") return;
  
  const featuredList = products.filter(p => p.featured).slice(0, 4);
  container.innerHTML = featuredList.map(p => generateProductCardHtml(p)).join("");
}

// --------------------------------------------------------------------------
// ۰۶. هسته فیلتراسیون هوشمند (FILTER & SEARCH ENGINE)
// --------------------------------------------------------------------------
function renderCatalogTabs() {
  const container = document.getElementById("dynamicTabsContainer");
  if (!container || typeof products === "undefined") return;

  // استخراج دسته‌بندی‌های منحصربه‌فرد از دیتابیس کالاها
  const categories = ["all", ...new Set(products.map(p => p.category))];
  
  container.innerHTML = categories.map(cat => {
    const label = cat === "all" ? "🔥 همه گجت‌ها" : cat;
    const activeClass = cat === activeCategoryFilter ? "active" : "";
    return `<button class="catalog-tab-node ${activeClass}" onclick="switchCatalogCategoryTab('${cat}')">${label}</button>`;
  }).join("");
}

function switchCatalogCategoryTab(category) {
  activeCategoryFilter = category;
  renderCatalogTabs();
  
  const badgeLabel = document.getElementById("catalogCurrentCategoryBadge");
  if (badgeLabel) {
    badgeLabel.innerText = category === "all" ? "همه گجت‌ها" : category;
  }
  
  applyCatalogMatrixRender();
}

function setupInteractiveFilters() {
  const slider = document.getElementById("priceRangeSlider");
  const display = document.getElementById("priceRangeValueDisplay");
  const searchInput = document.getElementById("liveSearchInput");
  const resetSearch = document.getElementById("resetSearchAction");
  const sortSelector = document.getElementById("catalogSortSelector");

  if (slider && display) {
    slider.addEventListener("input", (e) => {
      display.innerText = formatPriceToPersian(parseInt(e.target.value));
      applyCatalogMatrixRender();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      if (val.length > 0) {
        if (resetSearch) resetSearch.hidden = false;
        // اگر کاربر در تالار کاتالوگ نبود، هدایت شود
        if (currentActiveView !== "catalog" && currentActiveView !== "billing") {
          routerNavigate("catalog");
        }
      } else {
        if (resetSearch) resetSearch.hidden = true;
      }
      applyCatalogMatrixRender();
      renderQuickSearchDropdown(val);
    });
  }

  if (resetSearch) {
    resetSearch.addEventListener("click", () => {
      searchInput.value = "";
      resetSearch.hidden = true;
      document.getElementById("quickSearchDropdown").hidden = true;
      applyCatalogMatrixRender();
    });
  }

  if (sortSelector) {
    sortSelector.addEventListener("change", () => {
      applyCatalogMatrixRender();
    });
  }
}

function applyCatalogMatrixRender() {
  const container = document.getElementById("catalogProductsContainer");
  const emptyState = document.getElementById("catalogEmptyStateAlert");
  if (!container || typeof products === "undefined") return;

  const sliderValue = parseInt(document.getElementById("priceRangeSlider").value) || 100000000;
  const searchQuery = document.getElementById("liveSearchInput").value.toLowerCase().trim();
  const sortMethod = document.getElementById("catalogSortSelector").value;

  // ۱. اعمال فیلتر دسته‌بندی، رنج قیمت و کلمات کلیدی سرچ بار
  let filtered = products.filter(p => {
    const matchCat = activeCategoryFilter === "all" || p.category === activeCategoryFilter;
    const matchPrice = p.price <= sliderValue;
    const matchSearch = p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery);
    return matchCat && matchPrice && matchSearch;
  });

  // ۲. اعمال منطق ریاضی مرتب‌سازی (Sorting)
  if (sortMethod === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortMethod === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortMethod === "rating-desc") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  // ۳. نمایش وضعیت عدم یافت کالا (Empty State)
  if (filtered.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.hidden = false;
  } else {
    if (emptyState) emptyState.hidden = true;
    container.innerHTML = filtered.map(p => generateProductCardHtml(p)).join("");
  }
}

function resetAllDashboardFilters() {
  document.getElementById("priceRangeSlider").value = 100000000;
  document.getElementById("priceRangeValueDisplay").innerText = formatPriceToPersian(100000000);
  document.getElementById("liveSearchInput").value = "";
  document.getElementById("resetSearchAction").hidden = true;
  document.getElementById("catalogSortSelector").value = "default";
  activeCategoryFilter = "all";
  
  renderCatalogTabs();
  applyCatalogMatrixRender();
  invokeSystemToast("تمامی فیلترهای داشبورد کاتالوگ با موفقیت بازنشانی شدند.");
}

// --------------------------------------------------------------------------
// ۰۷. منوی همبرگری ریسپانسیو (MOBILE MENU HUB)
// --------------------------------------------------------------------------
function initResponsiveMenuHub() {
  const trigger = document.getElementById("mobileMenuHandler");
  const sidebar = document.getElementById("mobileNavigationSidebar");
  const closeBtn = document.getElementById("closeMobileMenuBtn");
  const backdrop = document.getElementById("globalUxBackdrop");

  const toggle = () => {
    const isExpanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", !isExpanded);
    sidebar.classList.toggle("active");
    backdrop.classList.toggle("active");
  };

  if (trigger) trigger.addEventListener("click", toggle);
  if (closeBtn) closeBtn.addEventListener("click", toggle);
  
  // کلیک روی لینک‌های منو موبایل منجر به بسته شدن آن شود
  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", () => {
      if (sidebar.classList.contains("active")) toggle();
    });
  });
}

// --------------------------------------------------------------------------
// ۰۸. مدیریت سبد خرید VIP (VIP SHOPPING CART ENGINE)
// --------------------------------------------------------------------------
function injectItemToVipCart(productId) {
  if (typeof products === "undefined") return;
  const targetProd = products.find(p => p.id === productId);
  if (!targetProd) return;

  const existingItem = vipCart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    vipCart.push({
      id: targetProd.id,
      name: targetProd.name,
      price: targetProd.price,
      image: targetProd.images ? targetProd.images[0] : 'assets/images/default.jpg',
      qty: 1
    });
  }

  saveVipCartState();
  syncCartUiBadges();
  renderVipCartDrawerItems();
  invokeSystemToast(`کالای «${targetProd.name.substring(0, 25)}...» به سبد خرید VIP افزوده شد.`);
}

function updateCartItemQty(productId, delta) {
  const item = vipCart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    vipCart = vipCart.filter(i => i.id !== productId);
  }

  saveVipCartState();
  syncCartUiBadges();
  renderVipCartDrawerItems();
  if (currentActiveView === "billing") renderInvoiceAuditSheet();
}

function saveVipCartState() {
  localStorage.setItem("luxury_vip_cart", JSON.stringify(vipCart));
}

function syncCartUiBadges() {
  const totalCount = vipCart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById("cartGlobalCounter");
  if (badge) badge.innerText = totalCount;
}

function renderVipCartDrawerItems() {
  const container = document.getElementById("cartDrawerItemsContainer");
  const totalSumText = document.getElementById("cartDrawerTotalSumText");
  if (!container) return;

  if (vipCart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px 10px; color:var(--lux-text-muted);">
        <p style="font-size:32px;">🛒</p>
        <p>سبد خرید شما در حال حاضر خالی است.</p>
      </div>
    `;
    if (totalSumText) totalSumText.innerText = formatPriceToPersian(0);
    return;
  }

  let grandSum = 0;
  container.innerHTML = vipCart.map(item => {
    const rowCost = item.price * item.qty;
    grandSum += rowCost;
    return `
      <div class="invoice-item-row-node" style="display:flex; align-items:center; gap:12px; background:var(--lux-bg-surface); padding:10px; border-radius:12px;">
        <img src="${item.image}" alt="${item.name}" style="width:50px; height:50px; object-fit:contain; border-radius:6px;">
        <div style="flex:1;">
          <h5 style="font-size:12px; font-weight:700; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${item.name}</h5>
          <span style="font-size:11px; color:var(--lux-gold-primary); font-weight:700;">${formatPriceToPersian(item.price)}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button onclick="updateCartItemQty(${item.id}, 1)" style="background:#222; width:22px; height:22px; border-radius:4px; font-weight:900; cursor:pointer;">+</button>
          <span style="font-family:'Orbitron',sans-serif; font-size:13px;">${item.qty}</span>
          <button onclick="updateCartItemQty(${item.id}, -1)" style="background:#222; width:22px; height:22px; border-radius:4px; font-weight:900; cursor:pointer;">-</button>
        </div>
      </div>
    `;
  }).join("");

  if (totalSumText) totalSumText.innerText = formatPriceToPersian(grandSum);
}

// دراور سبد خرید VIP با لیسنرهای اختصاصی خود
const drawer = document.getElementById("cartDrawerSidebar");
const drawerTrigger = document.getElementById("cartDrawerTrigger");
const drawerClose = document.getElementById("cartDrawerCloseBtn");
const globalBackdrop = document.getElementById("globalUxBackdrop");

const toggleDrawer = () => {
  drawer.classList.toggle("active");
  globalBackdrop.classList.toggle("active");
  if (drawer.classList.contains("active")) renderVipCartDrawerItems();
};

if (drawerTrigger) drawerTrigger.addEventListener("click", toggleDrawer);
if (drawerClose) drawerClose.addEventListener("click", toggleDrawer);
if (globalBackdrop) globalBackdrop.addEventListener("click", () => {
  if (drawer && drawer.classList.contains("active")) toggleDrawer();
  const comparePanel = document.getElementById("comparisonFixedPanel");
  if (comparePanel && comparePanel.classList.contains("active")) toggleComparePanel();
});

function redirectDrawerToCheckout() {
  toggleDrawer();
  routerNavigate("billing");
}

// --------------------------------------------------------------------------
// ۰۹. سیستم صدور فاکتور رسمی و کد تخفیف (BILLING & PROMO MODULE)
// --------------------------------------------------------------------------
function renderInvoiceAuditSheet() {
  const listContainer = document.getElementById("invoiceRealtimeList");
  const subtotalText = document.getElementById("invoiceSubtotalText");
  const discountWrapper = document.getElementById("invoiceDiscountWrapper");
  const discountText = document.getElementById("invoiceDiscountText");
  const grandTotalText = document.getElementById("invoiceGrandTotalText");
  
  if (!listContainer) return;

  if (vipCart.length === 0) {
    listContainer.innerHTML = `<p style="padding:15px; color:var(--lux-text-muted); text-align:center;">هیچ کالایی برای حسابرسی فاکتور انتخاب نشده است.</p>`;
    subtotalText.innerText = formatPriceToPersian(0);
    grandTotalText.innerText = formatPriceToPersian(0);
    if (discountWrapper) discountWrapper.hidden = true;
    return;
  }

  let grossSum = 0;
  listContainer.innerHTML = vipCart.map(item => {
    const cost = item.price * item.qty;
    grossSum += cost;
    return `
      <div class="invoice-item-row-node">
        <span style="font-size:13px; font-weight:700;">${item.name.substring(0, 40)}... (${item.qty} عدد)</span>
        <strong style="color:var(--lux-gold-primary); font-size:13px;">${formatPriceToPersian(cost)}</strong>
      </div>
    `;
  }).join("");

  subtotalText.innerText = formatPriceToPersian(grossSum);

  // محاسبه میزان تخفیف جاری فاکتور
  let discountAmount = 0;
  if (activeAppliedPromo === "FUTURE2026") {
    discountAmount = grossSum * 0.10; // ۱۰ درصد تخفیف پلاتینیوم
    if (discountWrapper) {
      discountWrapper.hidden = false;
      discountText.innerText = formatPriceToPersian(discountAmount) + "-";
    }
  } else {
    if (discountWrapper) discountWrapper.hidden = true;
  }

  const netPayable = grossSum - discountAmount;
  grandTotalText.innerText = formatPriceToPersian(netPayable);
}

function executePromoCodeValidation() {
  const code = document.getElementById("promoCodeField").value.trim();
  if (code === "FUTURE2026") {
    activeAppliedPromo = "FUTURE2026";
    invokeSystemToast("کپل پلاتینیوم اعمال شد! ۱۰٪ درصد تخفیف بر روی کل اقلام فاکتور کسر گردید.", "success");
    renderInvoiceAuditSheet();
  } else {
    invokeSystemToast("کد تخفیف وارد شده نامعتبر است یا منقضی شده است.", "danger");
  }
}

function interceptFormSubmission(event) {
  event.preventDefault();
  if (vipCart.length === 0) {
    invokeSystemToast("سبد فاکتور شما خالی است! ابتدا گجت‌های خود را انتخاب کنید.", "danger");
    return;
  }

  // آماده‌سازی مبلغ جهت انتقال به درگاه بانکی عضو شتاب شبیه‌سازی شده
  const grossSum = vipCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const discount = activeAppliedPromo === "FUTURE2026" ? grossSum * 0.10 : 0;
  const finalPrice = grossSum - discount;

  const bankOverlay = document.getElementById("virtualBankGatewayOverlay");
  const bankAmountLabel = document.getElementById("bankTerminalPayableAmount");

  if (bankOverlay && bankAmountLabel) {
    bankAmountLabel.innerText = formatPriceToPersian(finalPrice);
    bankOverlay.classList.add("active");
  }
}

// --------------------------------------------------------------------------
// ۱۰. شبیه‌ساز بانک مرکزی و شبکه شتاب (SHETAB CENTRAL TERMINAL)
// --------------------------------------------------------------------------
const bankForm = document.getElementById("bankVirtualCardForm");
const cancelBankBtn = document.getElementById("cancelPaymentGatewayAction");

if (cancelBankBtn) {
  cancelBankBtn.addEventListener("click", () => {
    document.getElementById("virtualBankGatewayOverlay").classList.remove("active");
    invokeSystemToast("تراکنش بانکی توسط خریدار لغو گردید.", "danger");
  });
}

if (bankForm) {
  bankForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const loadingScreen = document.getElementById("bankTerminalLoadingScreen");
    const statusMsg = document.getElementById("bankTerminalProgressStatus");
    
    loadingScreen.style.display = "flex";
    statusMsg.innerText = "در حال اتصال به سوئیچینگ شاپرک و بررسی موجودی حساب...";

    setTimeout(() => {
      statusMsg.innerText = "تراکنش تایید شد! در حال ثبت نهایی سند خرید در دفتر بلاکچین پلتفرم...";
      
      setTimeout(() => {
        // پایان موفقیت آمیز تراکنش
        loadingScreen.style.display = "none";
        document.getElementById("virtualBankGatewayOverlay").classList.remove("active");
        
        // خالی کردن سبد خرید
        vipCart = [];
        saveVipCartState();
        syncCartUiBadges();
        activeAppliedPromo = null;
        document.getElementById("billingMainForm").reset();

        // هدایت به صفحه اصلی با پیام موفقیت آمیز پیگیری کالا
        routerNavigate("home");
        const refCode = Math.floor(100000 + Math.random() * 900000);
        
        // ارسال مسیج نهایی فاکتور به صورت پاپ آپ
        alert(`🎉 تراکنش موفقیت‌آمیز بود!\nکد مرجع پیگیری شتاب: ${refCode}\nسفارش شما ثبت شد و به هاب ترانزیت اکسپرس ارسال گردید.`);
      }, 2000);
    }, 2000);
  });
}

// --------------------------------------------------------------------------
// ۱۱. تئاتر جزئیات کالا و سیستم مودال (PRODUCT DETAILED VISUALIZER MODAL)
// --------------------------------------------------------------------------
function openProductDetailVisualizer(productId) {
  if (typeof products === "undefined") return;
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  const modal = document.getElementById("globalProductDetailModal");
  document.getElementById("modalTheatreMainImg").src = prod.images ? prod.images[0] : 'assets/images/default.jpg';
  document.getElementById("modalMetaCategory").innerText = prod.category;
  document.getElementById("modalMetaTitle").innerText = prod.name;
  document.getElementById("modalMetaPrice").innerText = formatPriceToPersian(prod.price);
  document.getElementById("modalMetaRating").innerText = `★ ${prod.rating.toLocaleString("fa-IR")}`;
  document.getElementById("modalMetaDescription").innerHTML = prod.details ? prod.details : prod.description;

  // رندر کردن تامبنیل‌های گالری مودال
  const strip = document.getElementById("modalTheatreThumbnailsStrip");
  if (strip && prod.images) {
    strip.innerHTML = prod.images.map((img, index) => {
      const activeClass = index === 0 ? "active" : "";
      return `<img src="${img}" class="modal-thumb-node ${activeClass}" onclick="switchModalMainImage('${img}', this)" alt="Asset node">`;
    }).join("");
  }

  // ست کردن کلید شورتکات خرید در مودال
  const shortcutBtn = document.getElementById("modalShortcutAddToCartBtn");
  shortcutBtn.onclick = () => {
    injectItemToVipCart(prod.id);
    closeProductDetailVisualizer();
  };

  modal.classList.add("active");
}

function switchModalMainImage(imgSrc, thumbNode) {
  document.getElementById("modalTheatreMainImg").src = imgSrc;
  document.querySelectorAll(".modal-thumb-node").forEach(n => n.classList.remove("active"));
  thumbNode.classList.add("active");
}

function closeProductDetailVisualizer() {
  document.getElementById("globalProductDetailModal").classList.remove("active");
}

function invokeSystemShareApi() {
  const dummyUrl = window.location.href;
  navigator.clipboard.writeText(dummyUrl).then(() => {
    invokeSystemToast("پیوند اختصاصی اشتراک‌گذاری این گجت در حافظه کلیپ‌بورد کلاینت کپی شد.", "success");
  });
}

// --------------------------------------------------------------------------
// ۱۲. ماتریکس مقایسه فنی کالاها (TECHNICAL COMPARISON ENGINE)
// --------------------------------------------------------------------------
const comparePanel = document.getElementById("comparisonFixedPanel");
const compareTrigger = document.getElementById("comparePanelTrigger");
const compareClose = document.getElementById("closeComparePanelBtn");

const toggleComparePanel = () => {
  comparePanel.classList.toggle("active");
  if (comparePanel.classList.contains("active")) renderCompareMatrixItems();
};

if (compareTrigger) compareTrigger.addEventListener("click", toggleComparePanel);
if (compareClose) compareClose.addEventListener("click", toggleComparePanel);

function pushItemToCompareMatrix(productId) {
  if (typeof products === "undefined") return;
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  if (qualifiedCompareList.find(i => i.id === productId)) {
    invokeSystemToast("این گجت در حال حاضر در ماتریکس مقایسه فنی موجود است.", "danger");
    return;
  }

  if (qualifiedCompareList.length >= 3) {
    invokeSystemToast("حداکثر ظرفیت ماتریکس مقایسه، ۳ کالا به صورت همزمان است.", "danger");
    return;
  }

  qualifiedCompareList.push(prod);
  document.getElementById("compareCounterBadge").innerText = qualifiedCompareList.length;
  invokeSystemToast(`گجت «${prod.name.substring(0, 20)}...» به لیست مقایسه فنی الصاق شد.`);
  
  if (comparePanel.classList.contains("active")) renderCompareMatrixItems();
}

function removeItemFromCompareMatrix(productId) {
  qualifiedCompareList = qualifiedCompareList.filter(i => i.id !== productId);
  document.getElementById("compareCounterBadge").innerText = qualifiedCompareList.length;
  renderCompareMatrixItems();
}

function renderCompareMatrixItems() {
  const container = document.getElementById("compareItemsMatrixContainer");
  if (!container) return;

  if (qualifiedCompareList.length === 0) {
    container.innerHTML = `<p style="color:var(--lux-text-muted); text-align:center; padding-top:40px; width:100%;">هیچ گجتی جهت تحلیل ساختاری صادر نشده است. بر روی علامت ⚖️ کارت‌ها کلیک کنید.</p>`;
    return;
  }

  container.innerHTML = qualifiedCompareList.map(item => `
    <div style="flex:1; min-width:200px; background:var(--lux-bg-surface); border:1px solid var(--lux-border-white-alpha); padding:15px; border-radius:12px; position:relative;">
      <button onclick="removeItemFromCompareMatrix(${item.id})" style="position:absolute; top:8px; left:8px; color:red; cursor:pointer; font-weight:bold;">✕</button>
      <h5 style="font-size:13px; font-weight:800; margin-bottom:10px; height:36px; overflow:hidden;">${item.name.substring(0, 35)}...</h5>
      <p style="font-size:12px; color:var(--lux-gold-primary); margin-bottom:8px;">ارزش مالی: ${formatPriceToPersian(item.price)}</p>
      <div style="font-size:11px; color:var(--lux-text-muted); max-height:100px; overflow-y:auto; line-height:1.6;">
        ${item.description}
      </div>
    </div>
  `).join("");
}

// --------------------------------------------------------------------------
// ۱۳. هاب سرچ سریع شناور (QUICK FLOATING SEARCH DROPDOWN)
// --------------------------------------------------------------------------
function renderQuickSearchDropdown(val) {
  const dropdown = document.getElementById("quickSearchDropdown");
  const scrollArea = document.getElementById("quickSearchScrollArea");
  if (!dropdown || !scrollArea || typeof products === "undefined") return;

  if (val.length === 0) {
    dropdown.hidden = true;
    return;
  }

  const query = val.toLowerCase();
  const matched = products.filter(p => p.name.toLowerCase().includes(query)).slice(0, 5);

  if (matched.length === 0) {
    scrollArea.innerHTML = `<p style="padding:10px; font-size:12px; color:var(--lux-text-muted); text-align:center;">کالایی یافت نشد.</p>`;
  } else {
    scrollArea.innerHTML = matched.map(p => `
      <div onclick="openProductDetailVisualizer(${p.id}); document.getElementById('quickSearchDropdown').hidden=true;" style="display:flex; align-items:center; gap:10px; padding:8px; border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;">
        <img src="${p.images ? p.images[0] : 'assets/images/default.jpg'}" style="width:35px; height:35px; object-fit:contain;">
        <div style="flex:1;">
          <h6 style="font-size:12px; color:var(--lux-text-pure); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:320px;">${p.name}</h6>
          <span style="font-size:11px; color:var(--lux-gold-primary); font-weight:700;">${formatPriceToPersian(p.price)}</span>
        </div>
      </div>
    `).join("");
  }
  dropdown.hidden = false;
}

// بستن دراپ‌داون سرچ سریع در صورت کلیک روی فضاهای خارجی مرورگر
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("quickSearchDropdown");
  const searchInput = document.getElementById("liveSearchInput");
  if (dropdown && e.target !== dropdown && e.target !== searchInput) {
    dropdown.hidden = true;
  }
});

// --------------------------------------------------------------------------
// ۱۴. روبات پشتیبان هوشمند لایو چت (AI SUPPORT LIVE CHAT EMULATOR)
// --------------------------------------------------------------------------
function toggleLiveChatWidgetBox() {
  const chatBox = document.getElementById("liveChatInteractionBox");
  if (chatBox) chatBox.style.display = chatBox.style.display === "flex" ? "none" : "flex";
}

function dispatchUserChatMessage() {
  const input = document.getElementById("liveChatInputField");
  const flowZone = document.getElementById("liveChatMessagesFlowZone");
  if (!input || input.value.trim() === "") return;

  const userText = input.value.trim();
  
  // ۱. الصاق پیام خریدار به باکس چت
  const userBubble = document.createElement("div");
  userBubble.className = "chat-msg-bubble user";
  userBubble.style.alignSelf = "flex-end";
  userBubble.style.background = "var(--lux-gold-gradient)";
  userBubble.style.color = "var(--lux-text-dark)";
  userBubble.style.padding = "10px 14px";
  userBubble.style.borderRadius = "12px 12px 0 12px";
  userBubble.style.fontSize = "13px";
  userBubble.style.maxWidth = "80%";
  userBubble.innerText = userText;
  flowZone.appendChild(userBubble);
  
  input.value = "";
  flowZone.scrollTop = flowZone.scrollHeight;

  // ۲. پردازش و آنالیز لغات کلیدی جهت پاسخ‌دهی روبات
  setTimeout(() => {
    let aiResponse = "درخواست شما دریافت شد. کارشناسان ارشد ترانزیت لوکس گجت به زودی با شما ارتباط برقرار خواهند کرد.";
    
    for (const key in aiChatBotLexicon) {
      if (userText.includes(key)) {
        aiResponse = aiChatBotLexicon[key];
        break;
      }
    }

    const aiBubble = document.createElement("div");
    aiBubble.className = "chat-msg-bubble agent";
    aiBubble.style.alignSelf = "flex-start";
    aiBubble.style.background = "rgba(255,255,255,0.04)";
    aiBubble.style.border = "1px solid var(--lux-border-white-alpha)";
    aiBubble.style.color = "var(--lux-text-pure)";
    aiBubble.style.padding = "10px 14px";
    aiBubble.style.borderRadius = "12px 12px 12px 0";
    aiBubble.style.fontSize = "13px";
    aiBubble.style.maxWidth = "80%";
    aiBubble.innerText = aiResponse;
    
    flowZone.appendChild(aiBubble);
    flowZone.scrollTop = flowZone.scrollHeight;
  }, 1000);
}

// لیسنر ارسال پیام با زدن کلید اینتر در چت باکس
const chatInput = document.getElementById("liveChatInputField");
if (chatInput) {
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") dispatchUserChatMessage();
  });
}

// --------------------------------------------------------------------------
// ۱۵. تایمر شمارش معکوس کمپین پلاتینیوم (CAMPAIGN COUNTDOWN ENGINE)
// --------------------------------------------------------------------------
function runCampaignCountdownTimer() {
  let hours = 23;
  let minutes = 59;
  let seconds = 59;

  const hDOM = document.getElementById("timer-hours");
  const mDOM = document.getElementById("timer-minutes");
  const sDOM = document.getElementById("timer-seconds");

  const interval = setInterval(() => {
    seconds--;
    if (seconds < 0) {
      seconds = 59;
      minutes--;
      if (minutes < 0) {
        minutes = 59;
        hours--;
        if (hours < 0) {
          clearInterval(interval);
          hours = 0; minutes = 0; seconds = 0;
        }
      }
    }

    if (hDOM) hDOM.innerText = hours.toString().padStart(2, "0");
    if (mDOM) mDOM.innerText = minutes.toString().padStart(2, "0");
    if (sDOM) sDOM.innerText = seconds.toString().padStart(2, "0");
  }, 1000);
}