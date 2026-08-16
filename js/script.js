/* Main script for AutoMarket Maroc SPA */
(function(){
  // Inject config
  document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const logoImg = document.getElementById('logoImg');
    const dealerNameEls = document.querySelectorAll('#dealerName, #dealerNameHero, #dealerNameFooter');
    const phoneLink = document.getElementById('phoneLink');
    const phoneText = document.getElementById('phoneText');
    const emailText = document.getElementById('emailText');
    const addressText = document.getElementById('addressText');
    const mapEmbed = document.getElementById('mapEmbed');
    const heroBg = document.getElementById('heroBg');
    const yearEl = document.getElementById('year');

    // set from CONFIG
    if (window.CONFIG) {
      logoImg.src = CONFIG.logoPath;
      dealerNameEls.forEach(el => el.textContent = CONFIG.dealerName);
      phoneLink.href = `tel:${CONFIG.phone}`;
      phoneText.href = `tel:${CONFIG.phone}`;
      phoneText.textContent = CONFIG.phone;
      emailText.href = `mailto:${CONFIG.email}`;
      emailText.textContent = CONFIG.email;
      addressText.textContent = CONFIG.address;
      mapEmbed.src = CONFIG.googleMaps;
      document.getElementById('whatsappSell').href = `https://wa.me/${CONFIG.whatsapp.replace(/[^0-9]/g,'')}`;
      document.getElementById('modalWhatsApp').href = `https://wa.me/${CONFIG.whatsapp.replace(/[^0-9]/g,'')}`;
      document.getElementById('facebookLink').href = CONFIG.facebook;
      document.getElementById('instagramLink').href = CONFIG.instagram;
      heroBg.style.backgroundImage = `url("${CONFIG.heroBgPath}")`;
      yearEl.textContent = new Date().getFullYear();
    }

    // Render cars
    const carsGrid = document.getElementById('carsGrid');
    const brandFilter = document.getElementById('brandFilter');
    const modelFilter = document.getElementById('modelFilter');
    const cityFilter = document.getElementById('cityFilter');
    const searchBtn = document.getElementById('searchBtn');

    function formatPrice(mad){
      return new Intl.NumberFormat('en-US').format(mad) + ' MAD';
    }

    function renderCars(list){
      carsGrid.innerHTML = '';
      if (!list.length) {
        carsGrid.innerHTML = '<p>No cars found matching your criteria.</p>';
        return;
      }
      list.forEach(car => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
         <img src="${car.image}" alt="${car.brand} ${car.model}">
          <div class="card-body">
            <div class="card-title">
              <h4>${car.brand} ${car.model}</h4>
              <div class="price">${formatPrice(car.priceMAD)}</div>
            </div>
            <div class="card-specs">
              <div>${car.mileage}</div>
              <div>${car.transmission}</div>
              <div>${car.city}</div>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn" data-id="${car.id}" aria-expanded="false">View</button>
            <a class="btn whatsapp" href="https://wa.me/${CONFIG.whatsapp.replace(/[^0-9]/g,'')}?text=I'm%20interested%20in%20the%20${encodeURIComponent(car.brand+' '+car.model)}" target="_blank">WhatsApp</a>
          </div>
        `;
        carsGrid.appendChild(card);
      });

      // attach view handlers
      carsGrid.querySelectorAll('.card .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          openModal(id);
        });
      });
    }

    // populate filters
    function populateFilters(){
      const brands = Array.from(new Set(CARS_DATA.map(c=>c.brand)));
      brands.forEach(b=>{
        const opt = document.createElement('option'); opt.value = b; opt.textContent = b; brandFilter.appendChild(opt);
      });
      const cities = Array.from(new Set(CARS_DATA.map(c=>c.city)));
      cities.forEach(c=>{
        const opt = document.createElement('option'); opt.value = c; opt.textContent = c; cityFilter.appendChild(opt);
      });
    }

    // filtering
    function getFilters(){
      return {
        brand: brandFilter.value.trim(),
        model: modelFilter.value.trim().toLowerCase(),
        city: cityFilter.value.trim()
      };
    }

    function applyFilters(){
      const {brand, model, city} = getFilters();
      let filtered = CARS_DATA.filter(c => {
        if (brand && c.brand !== brand) return false;
        if (city && c.city !== city) return false;
        if (model && !(c.model.toLowerCase().includes(model) || c.brand.toLowerCase().includes(model))) return false;
        return true;
      });
      renderCars(filtered);
    }

    // Real-time filter setup
    brandFilter.addEventListener('change', applyFilters);
    cityFilter.addEventListener('change', applyFilters);
    modelFilter.addEventListener('input', applyFilters);
    searchBtn.addEventListener('click', applyFilters);

    populateFilters();
    renderCars(CARS_DATA);

    // Modal logic
    const modal = document.getElementById('carModal');
    const modalClose = document.getElementById('modalClose');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalPrice = document.getElementById('modalPrice');
    const modalMileage = document.getElementById('modalMileage');
    const modalTransmission = document.getElementById('modalTransmission');
    const modalCity = document.getElementById('modalCity');
    const modalDesc = document.getElementById('modalDesc');
    const modalWhatsApp = document.getElementById('modalWhatsApp');

    function openModal(id){
      const car = CARS_DATA.find(c=>c.id===id);
      if (!car) return;
      modalImage.src = car.image;
      modalTitle.textContent = car.brand + ' ' + car.model;
      modalPrice.textContent = formatPrice(car.priceMAD);
      modalMileage.textContent = 'Mileage: ' + car.mileage;
      modalTransmission.textContent = 'Transmission: ' + car.transmission;
      modalCity.textContent = 'City: ' + car.city;
      modalDesc.textContent = car.description || '';
      modalWhatsApp.href = `https://wa.me/${CONFIG.whatsapp.replace(/[^0-9]/g,'')}?text=I%20want%20to%20know%20more%20about%20the%20${encodeURIComponent(car.brand+' '+car.model)}`;
      modal.setAttribute('aria-hidden','false');
    }

    function closeModal(){
      modal.setAttribute('aria-hidden','true');
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e)=>{ if (e.target===modal) closeModal(); });
    document.addEventListener('keydown', (e)=>{ if (e.key==='Escape') closeModal(); });
  });
})();
