document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('carDetails');
  if (!container) {
    return;
  }

  await ensureCarsData();

  const carId = new URLSearchParams(location.search).get('id');
  const car = Array.isArray(window.CARS_DATA)
    ? window.CARS_DATA.find((item) => String(item.id) === String(carId))
    : undefined;

  if (!car) {
    container.innerHTML = `
      <div class="details-not-found">
        <h1>Véhicule introuvable</h1>
        <p>Cette voiture n'existe pas ou n'est plus disponible.</p>
        <a href="index.html#cars" class="btn btn-primary">Retour aux voitures</a>
      </div>
    `;
    return;
  }

  const rawGallery = Array.isArray(car.gallery) && car.gallery.length
    ? car.gallery
    : [car.main_image];
  // remove falsy entries and duplicates, keep main_image first when available
  const uniqueGallery = Array.from(new Set(rawGallery.filter(Boolean)));
  if (car.main_image) {
    const mainIdx = uniqueGallery.indexOf(car.main_image);
    if (mainIdx > -1) uniqueGallery.splice(mainIdx, 1);
    uniqueGallery.unshift(car.main_image);
  }
  const resolvedGallery = uniqueGallery.map((image) => resolvePublicImageUrl(image, 'images/placeholder.svg'));
  const price = Number(car.price) || 0;
  const whatsappNumber = String((window.CONFIG && window.CONFIG.whatsapp) || '').replace(/\D/g, '');

  function whatsappLink(message) {
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  function formatPrice(value) {
    return `${new Intl.NumberFormat('fr-MA').format(Number(value) || 0)} MAD`;
  }

  function formatMileage(value) {
    return `${new Intl.NumberFormat('fr-MA').format(Number(value) || 0)} km`;
  }

  container.innerHTML = `
    <article class="car-detail-layout">
      <div class="details-gallery">
        <img class="main-image" src="${resolvedGallery[0]}" alt="${car.brand} ${car.model}" loading="lazy" decoding="async">
        <div class="gallery-controls">
          <button type="button" class="gallery-btn" data-role="prev-image" aria-label="Image précédente">←</button>
          <div class="thumbnails">
            ${resolvedGallery.map((image, index) => `
              <img
                src="${image}"
                alt="${car.brand} ${car.model} photo ${index + 1}"
                class="thumbnail ${index === 0 ? 'active' : ''}"
                data-index="${index}"
                loading="lazy"
                decoding="async"
              >
            `).join('')}
          </div>
          <button type="button" class="gallery-btn" data-role="next-image" aria-label="Image suivante">→</button>
        </div>
      </div>

      <div class="details-info">
        <div class="details-badges">
          <span class="badge">${car.badgeText || 'Disponible'}</span>
          <span class="badge">✓ ${car.inspectionStatus || 'Inspecté'}</span>
        </div>

        <h1>${car.brand || ''} ${car.model || ''}</h1>
        <span class="details-year">Année ${car.year || ''} · ${car.city || ''}</span>
        <div class="details-price">${formatPrice(price)}</div>
        <p class="details-description">${car.description || ''}</p>

        <table class="spec-table">
          <tr><td>🚗 Marque</td><td>${car.brand || ''}</td></tr>
          <tr><td>📅 Année</td><td>${car.year || ''}</td></tr>
          <tr><td>⛽ Carburant</td><td>${car.fuel || ''}</td></tr>
          <tr><td>⚙️ Boîte</td><td>${car.transmission || ''}</td></tr>
          <tr><td>🛣️ Kilométrage</td><td>${formatMileage(car.mileage)}</td></tr>
          <tr><td>📍 Ville</td><td>${car.city || ''}</td></tr>
          <tr><td>🖼️ Image principale</td><td>${car.main_image || ''}</td></tr>
        </table>

        <div class="details-actions">
          <a id="detailsWhatsApp" href="#" target="_blank" rel="noopener" class="btn btn-whatsapp">💬 WhatsApp</a>
          <a href="tel:${window.CONFIG && window.CONFIG.phone ? window.CONFIG.phone : ''}" class="btn btn-primary">📞 Appeler</a>
        </div>
      </div>
    </article>
  `;

  const mainImage = document.querySelector('.main-image');
  const thumbnails = Array.from(document.querySelectorAll('.thumbnail'));
  let currentImage = 0;

  function setImage(index) {
    if (!resolvedGallery.length) {
      return;
    }
    currentImage = (index + resolvedGallery.length) % resolvedGallery.length;
    if (mainImage) {
      mainImage.src = resolvedGallery[currentImage];
    }
    thumbnails.forEach((thumb, thumbIndex) => {
      thumb.classList.toggle('active', thumbIndex === currentImage);
    });
  }

  document.querySelector('[data-role="prev-image"]').addEventListener('click', () => setImage(currentImage - 1));
  document.querySelector('[data-role="next-image"]').addEventListener('click', () => setImage(currentImage + 1));
  thumbnails.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      setImage(Number(thumb.dataset.index));
    });
  });

  const detailsWhatsApp = document.getElementById('detailsWhatsApp');
  if (detailsWhatsApp) {
    detailsWhatsApp.href = whatsappLink(`Bonjour AutoMarket Maroc, je suis intéressé par la ${car.brand} ${car.model} ${car.year} affichée à ${formatPrice(price)}.`);
  }
});