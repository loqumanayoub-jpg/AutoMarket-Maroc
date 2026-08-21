/* =====================================================
   AutoMarket Maroc - Cars JavaScript (Supabase)
===================================================== */

let carsData = [];

// 1. جلب السيارات من Supabase عند تحميل الصفحة
async function loadCars() {
  const carsGrid = document.getElementById("carsGrid");
  if (!carsGrid) return;

  carsGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 40px;'>جاري تحميل السيارات...</p>";

  try {
    // جلب البيانات من Supabase مع حماية فـ حالة عدم وجود الدالة
    if (typeof getCarsFromSupabase === "function") {
      carsData = await getCarsFromSupabase();
    } else {
      carsData = window.CARS_DATA || [];
    }

    if (!carsData || carsData.length === 0) {
      carsGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 40px;'>لا توجد سيارات متاحة حالياً.</p>";
      return;
    }

    // حفظ السيارات فـ المتغير العام للبحث والفلاتر
    window.CARS_DATA = carsData;

    displayCars(carsData);
    populateFilters(carsData);
    setupSearchForm();
  } catch (error) {
    console.error("Error loading cars:", error);
    carsGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: red;'>حدث خطأ أثناء جلب السيارات.</p>";
  }
}

// 2. عرض السيارات داخل الشبكة (Grid) مع تنويع الصور
function displayCars(cars) {
  const carsGrid = document.getElementById("carsGrid");
  if (!carsGrid) return;
  
  carsGrid.innerHTML = "";

  // قراءة الإعدادات بأمان لتفادي أخطاء siteConfig
  const config = (typeof siteConfig !== "undefined") ? siteConfig : (window.siteConfig || {});
  const whatsappNum = config.whatsappNumber || config.contactPhone || '212600000000';

  // صور افتراضية متنوعة إذا كانت الصور فـ Supabase مكررة
  const defaultImages = [
    'images/cars/car1.webp',
    'images/cars/car2.webp',
    'images/cars/car3.webp'
  ];

  cars.forEach((car, index) => {
    const card = document.createElement("div");
    card.className = "card";
    
    // تغيير الصورة إذا كانت مكررة أو غير متاحة
    const carImage = (car.image && !car.image.includes('car1.webp')) 
      ? car.image 
      : defaultImages[index % defaultImages.length];

    const waMsg = encodeURIComponent(`السلام عليكم، أنا مهتم بالسيارة ${car.brand || ''} ${car.model || ''} الثمن: ${car.price || ''} درهم.`);
    const waUrl = `https://wa.me/${whatsappNum}?text=${waMsg}`;

    card.innerHTML = `
      ${car.badgeText ? `<span class="trust-badge">${car.badgeText}</span>` : ''}
      <div class="card-img-wrapper">
        <img src="${carImage}" alt="${car.brand || ''} ${car.model || ''}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="card-title">
          <h4>${car.brand || ''} ${car.model || ''}</h4>
          <span class="year">${car.year || ''}</span>
        </div>
        <div class="price-tag">${Number(car.price || 0).toLocaleString()} MAD</div>
        <div class="card-specs-grid">
          <div class="spec-item"><span class="spec-icon">🛣️</span> ${Number(car.mileage || 0).toLocaleString()} km</div>
          <div class="spec-item"><span class="spec-icon">⚙️</span> ${car.transmission || 'Manuelle'}</div>
          <div class="spec-item"><span class="spec-icon">⛽</span> ${car.fuel || 'Gazole'}</div>
          <div class="spec-item"><span class="spec-icon">📍</span> ${car.city || 'Maroc'}</div>
        </div>
      </div>
      <div class="card-actions">
        <a href="car-details.html?id=${car.id}" class="btn secondary">Details</a>
        <a href="${waUrl}" target="_blank" rel="noopener" class="btn whatsapp">WhatsApp</a>
      </div>
    `;
    carsGrid.appendChild(card);
  });
}

// 3. ملء قوائم الفلاتر تلقائياً
function populateFilters(cars) {
  const brandSelect = document.getElementById("brandFilter");
  const citySelect = document.getElementById("cityFilter");

  if (!brandSelect || !citySelect) return;

  const brands = [...new Set(cars.map(c => c.brand))].filter(Boolean);
  const cities = [...new Set(cars.map(c => c.city))].filter(Boolean);

  brandSelect.innerHTML = '<option value="">Any Brand</option>' + brands.map(b => `<option value="${b}">${b}</option>`).join('');
  citySelect.innerHTML = '<option value="">Any City</option>' + cities.map(c => `<option value="${c}">${c}</option>`).join('');
}

// 4. تفعيل نموذج البحث والفلترة
function setupSearchForm() {
  const searchBtn = document.getElementById("searchBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (searchBtn) {
    searchBtn.onclick = filterCars;
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      document.getElementById("searchForm")?.reset();
      displayCars(carsData);
    };
  }
}

// 5. فلترة السيارات
function filterCars() {
  const brand = document.getElementById("brandFilter")?.value;
  const fuel = document.getElementById("fuelFilter")?.value;
  const trans = document.getElementById("transFilter")?.value;
  const city = document.getElementById("cityFilter")?.value;
  const maxPrice = parseFloat(document.getElementById("priceFilter")?.value);

  const filtered = carsData.filter(car => {
    return (!brand || car.brand === brand) &&
           (!fuel || car.fuel === fuel) &&
           (!trans || car.transmission === trans) &&
           (!city || car.city === city) &&
           (!maxPrice || Number(car.price) <= maxPrice);
  });

  displayCars(filtered);
}

// تشغيل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", loadCars);