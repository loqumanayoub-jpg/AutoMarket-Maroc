/* =====================================================
   AutoMarket Maroc - Main JavaScript
===================================================== */

// Ensure the shared car dataset exists before any legacy code touches it.
// The public landing page loads the live cars from Supabase on startup.
if (typeof CARS_DATA === 'undefined') {
  CARS_DATA = [];
  try { if (typeof window !== 'undefined') window.CARS_DATA = CARS_DATA; } catch (e) { /* ignore */ }
}

document.addEventListener("DOMContentLoaded", async () => {

  /* ================= CONFIG ================= */

  const whatsappNumber =
    String(CONFIG.whatsapp)
      .replace(/\D/g, "");


  function whatsappLink(message = "") {

    const encodedMessage =
      encodeURIComponent(message);

    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  }


  /* ================= GENERAL INFO ================= */

  const logoImg =
    document.getElementById("logoImg");

  const dealerName =
    document.getElementById("dealerName");

  const heroBg =
    document.getElementById("heroBg");

  const phoneText =
    document.getElementById("phoneText");

  const emailText =
    document.getElementById("emailText");

  const addressText =
    document.getElementById("addressText");

  const mapEmbed =
    document.getElementById("mapEmbed");

  const year =
    document.getElementById("year");


  if (logoImg) {
    logoImg.src = CONFIG.logoPath;
  }

  if (dealerName) {
    dealerName.textContent =
      CONFIG.dealerName;
  }

  if (heroBg) {
    heroBg.style.backgroundImage =
      `url("${CONFIG.heroBgPath}")`;
  }

  if (phoneText) {

    phoneText.textContent =
      CONFIG.phone;

    phoneText.href =
      `tel:${CONFIG.phone}`;
  }

  if (emailText) {

    emailText.textContent =
      CONFIG.email;

    emailText.href =
      `mailto:${CONFIG.email}`;
  }

  if (addressText) {
    addressText.textContent =
      CONFIG.address;
  }

  if (mapEmbed) {
    mapEmbed.src =
      CONFIG.googleMaps;
  }

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }


  /* ================= WHATSAPP ================= */

  const whatsappElements = [

    document.getElementById("whatsappHeader"),

    document.getElementById("heroWhatsapp"),

    document.getElementById("contactWhatsapp"),

    document.getElementById("footerWhatsapp"),

    document.getElementById("floatingWhatsapp")

  ];


  whatsappElements.forEach(element => {

    if (!element) return;

    element.href =
      whatsappLink(
        "Bonjour AutoMarket Maroc, je souhaite avoir plus d'informations."
      );

  });


  /* ================= SOCIAL ================= */

  const facebook =
    document.getElementById("facebookLink");

  const instagram =
    document.getElementById("instagramLink");


  if (facebook) {
    facebook.href = CONFIG.facebook;
  }

  if (instagram) {
    instagram.href = CONFIG.instagram;
  }


  /* ================= MOBILE MENU ================= */

  const menuButton =
    document.getElementById("mobileMenuBtn");

  const mainNav =
    document.getElementById("mainNav");


  if (menuButton && mainNav) {

    menuButton.addEventListener(
      "click",
      () => {

        mainNav.classList.toggle("open");

      }
    );


    mainNav.querySelectorAll("a")
      .forEach(link => {

        link.addEventListener(
          "click",
          () => {

            mainNav.classList.remove("open");

          }
        );

      });

  }


  /* ================= FILTER ELEMENTS ================= */

  const carsGrid =
    document.getElementById("carsGrid");

  const brandFilter =
    document.getElementById("brandFilter");

  const fuelFilter =
    document.getElementById("fuelFilter");

  const transFilter =
    document.getElementById("transFilter");

  const cityFilter =
    document.getElementById("cityFilter");

  const priceFilter =
    document.getElementById("priceFilter");

  const searchForm =
    document.getElementById("searchForm");

  const resetBtn =
    document.getElementById("resetBtn");

  const resultsCount =
    document.getElementById("resultsCount");


  /* ================= FORMATTERS ================= */

  function formatPrice(price) {

    return new Intl.NumberFormat(
      "fr-MA"
    ).format(price) + " MAD";

  }


  function formatMileage(km) {

    return new Intl.NumberFormat(
      "fr-MA"
    ).format(km) + " km";

  }


  /* ================= FILTER OPTIONS ================= */

  function populateFilters() {

    const brands =
      [...new Set(
        CARS_DATA.map(car => car.brand)
      )].sort();


    const cities =
      [...new Set(
        CARS_DATA.map(car => car.city)
      )].sort();


    brands.forEach(brand => {

      const option =
        document.createElement("option");

      option.value = brand;
      option.textContent = brand;

      brandFilter.appendChild(option);

    });


    cities.forEach(city => {

      const option =
        document.createElement("option");

      option.value = city;
      option.textContent = city;

      cityFilter.appendChild(option);

    });

  }


  /* ================= FILTER ================= */

  function getFilteredCars() {

    const brand =
      brandFilter.value;

    const fuel =
      fuelFilter.value;

    const transmission =
      transFilter.value;

    const city =
      cityFilter.value;

    const maxPrice =
      Number(priceFilter.value) || Infinity;


    return CARS_DATA.filter(car => {

      if (
        brand &&
        car.brand !== brand
      ) {
        return false;
      }


      if (
        fuel &&
        car.fuel !== fuel
      ) {
        return false;
      }


      if (
        transmission &&
        car.transmission !== transmission
      ) {
        return false;
      }


      if (
        city &&
        car.city !== city
      ) {
        return false;
      }


      if (
        car.price > maxPrice
      ) {
        return false;
      }


      return true;

    });

  }


  /* ================= RENDER CARS ================= */

  function renderCars(cars) {

    carsGrid.innerHTML = "";


    if (resultsCount) {

      resultsCount.textContent =
        `${cars.length} véhicule${cars.length > 1 ? "s" : ""}`;

    }


    if (!cars.length) {

      carsGrid.innerHTML = `

        <div class="empty-state">

          <h3>Aucun véhicule trouvé</h3>

          <p>
            Essayez de modifier vos critères de recherche.
          </p>

        </div>

      `;

      return;

    }


    cars.forEach(car => {

      const card =
        document.createElement("article");

      card.className = "card";


      const badgeClass =
        car.badge || "new";


      card.innerHTML = `

        <div class="card-image">

          <img
            src="${resolvePublicImageUrl(car.main_image, 'images/placeholder.svg')}"
            alt="${car.brand} ${car.model}"
            loading="lazy"
          >

          <div class="card-badges">

            <span class="badge ${badgeClass}">
              ${car.badgeText || "Sélection"}
            </span>

            <span class="badge">
              ✓ ${car.inspectionStatus}
            </span>

          </div>

        </div>


        <div class="card-content">

          <div class="card-title-row">

            <div>

              <h3 class="card-title">
                ${car.brand} ${car.model}
              </h3>

              <span class="card-year">
                ${car.year}
              </span>

            </div>

            <div class="price">
              ${formatPrice(car.price)}
            </div>

          </div>


          <div class="card-location">
            📍 ${car.city}
          </div>


          <div class="card-specs">

            <div class="spec">
              ⛽ ${car.fuel}
            </div>

            <div class="spec">
              ⚙️ ${car.transmission}
            </div>

            <div class="spec">
              🛣️ ${formatMileage(car.mileage)}
            </div>

            <div class="spec">
              🛡️ ${car.guaranteeStatus}
            </div>

          </div>


          <div class="card-actions">

            <a
              href="car-details.html?id=${car.id}"
              class="btn btn-primary"
            >
              Voir détails
            </a>

            <a
              href="${whatsappLink(
                `Bonjour AutoMarket Maroc, je suis intéressé par la ${car.brand} ${car.model} ${car.year}.`
              )}"
              target="_blank"
              rel="noopener"
              class="btn btn-whatsapp"
            >
              WhatsApp
            </a>

          </div>

        </div>

      `;


      carsGrid.appendChild(card);

    });

  }


  /* ================= SEARCH ================= */

  function applyFilters() {

    const filtered =
      getFilteredCars();

    renderCars(filtered);

  }


  if (searchForm) {

    searchForm.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        applyFilters();

        document
          .getElementById("cars")
          ?.scrollIntoView({
            behavior: "smooth"
          });

      }
    );

  }


  [
    brandFilter,
    fuelFilter,
    transFilter,
    cityFilter
  ].forEach(select => {

    select.addEventListener(
      "change",
      applyFilters
    );

  });


  if (priceFilter) {

    priceFilter.addEventListener(
      "input",
      applyFilters
    );

  }


  if (resetBtn) {

    resetBtn.addEventListener(
      "click",
      () => {

        brandFilter.value = "";
        fuelFilter.value = "";
        transFilter.value = "";
        cityFilter.value = "";
        priceFilter.value = "";

        renderCars(CARS_DATA);

      }
    );

  }


  /* ================= INITIALIZE ================= */

  async function loadCarsData() {
    try {
      const cars = typeof ensureCarsData === 'function'
        ? await ensureCarsData()
        : await getCarsFromSupabase();

      CARS_DATA = Array.isArray(cars) ? cars : [];
      if (typeof window !== 'undefined') window.CARS_DATA = CARS_DATA;

      populateFilters();
      renderCars(CARS_DATA);
    } catch (error) {
      console.error('Unable to load cars data:', error);
      CARS_DATA = [];
      if (typeof window !== 'undefined') window.CARS_DATA = CARS_DATA;
      populateFilters();
      renderCars(CARS_DATA);
    }
  }

  await loadCarsData();


  /* ================= STATS COUNTERS ================= */

  const statElements =
    document.querySelectorAll(
      ".stat-item strong[data-target]"
    );


  function animateCounter(element) {

    const target =
      Number(
        element.dataset.target
      );

    const duration = 1200;

    const startTime =
      performance.now();


    function update(currentTime) {

      const progress =
        Math.min(
          (currentTime - startTime) /
          duration,
          1
        );


      const value =
        Math.floor(
          progress * target
        );


      const hasPercent =
        element.textContent.includes("%");


      element.textContent =
        hasPercent
          ? `${value}%`
          : value;


      if (progress < 1) {

        requestAnimationFrame(update);

      }

    }


    requestAnimationFrame(update);

  }


  if (statElements.length) {

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (
              entry.isIntersecting &&
              !entry.target.dataset.animated
            ) {

              entry.target.dataset.animated =
                "true";

              animateCounter(
                entry.target
              );

            }

          });

        },
        {
          threshold: .5
        }
      );


    statElements.forEach(
      element =>
        observer.observe(element)
    );

  }


  /* ================= SELL WIZARD ================= */

  const sellForm =
    document.getElementById("sellForm");

  const steps =
    document.querySelectorAll(
      ".wizard-step"
    );

  let currentStep = 1;


  function showStep(stepNumber) {

    currentStep = stepNumber;


    steps.forEach(step => {

      step.classList.toggle(
        "active",
        Number(step.dataset.step) === stepNumber
      );

    });

  }


  document
    .querySelectorAll(".next-step")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const current =
            document.querySelector(
              `.wizard-step[data-step="${currentStep}"]`
            );


          const requiredInputs =
            current.querySelectorAll(
              "input[required], select[required]"
            );


          let valid = true;


          requiredInputs.forEach(input => {

            if (!input.checkValidity()) {

              input.reportValidity();

              valid = false;

            }

          });


          if (!valid) return;


          if (currentStep < 3) {

            showStep(
              currentStep + 1
            );

          }

        }
      );

    });


  document
    .querySelectorAll(".prev-step")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          if (currentStep > 1) {

            showStep(
              currentStep - 1
            );

          }

        }
      );

    });


  /* ================= IMAGE PREVIEW ================= */

  const imageInput =
    document.getElementById("sellImages");

  const imagePreview =
    document.getElementById("imagePreview");


  if (
    imageInput &&
    imagePreview
  ) {

    imageInput.addEventListener(
      "change",
      () => {

        imagePreview.innerHTML = "";


        [...imageInput.files]
          .slice(0, 8)
          .forEach(file => {

            if (!file.type.startsWith("image/")) {
              return;
            }


            const reader =
              new FileReader();


            reader.onload = event => {

              const img =
                document.createElement("img");

              img.src =
                event.target.result;

              img.alt =
                "Aperçu de la voiture";

              imagePreview.appendChild(img);

            };


            reader.readAsDataURL(file);

          });

      }
    );

  }


  /* ================= SELL FORM → WHATSAPP ================= */

  if (sellForm) {

    sellForm.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const formData =
          new FormData(sellForm);


        const message = `

Bonjour AutoMarket Maroc,

Je souhaite vendre ma voiture.

👤 Nom:
${formData.get("sellerName")}

📞 Téléphone:
${formData.get("sellerPhone")}

🚗 Marque:
${formData.get("sellBrand")}

🚘 Modèle:
${formData.get("sellModel")}

📅 Année:
${formData.get("sellYear")}

💰 Prix souhaité:
${formData.get("sellPrice")} MAD

⛽ Carburant:
${formData.get("sellFuel")}

⚙️ Boîte:
${formData.get("sellTransmission")}

🛣️ Kilométrage:
${formData.get("sellMileage")} km

📍 Ville:
${formData.get("sellCity")}

📝 Description:
${formData.get("sellDescription")}

        `.trim();


        // Save submission to Supabase messages table (non-blocking)
        try {
          (async () => {
            const payload = {
              name: formData.get("sellerName"),
              phone: formData.get("sellerPhone"),
              brand: formData.get("sellBrand"),
              model: formData.get("sellModel"),
              year: parseInt(formData.get("sellYear")) || null,
              price: parseFloat(formData.get("sellPrice")) || null,
              fuel: formData.get("sellFuel"),
              transmission: formData.get("sellTransmission"),
              mileage: parseInt(formData.get("sellMileage")) || null,
              city: formData.get("sellCity"),
              description: formData.get("sellDescription"),
              created_at: new Date().toISOString()
            };

            // If images were selected, try uploading them to Supabase Storage
            try {
              const imageInput = document.getElementById('sellImages');
              const images = [];

              if (imageInput && imageInput.files && imageInput.files.length) {
                const files = Array.from(imageInput.files).slice(0, 8);
                for (let i = 0; i < files.length; i++) {
                  const file = files[i];
                  const filename = `sell_${Date.now()}_${i}_${file.name.replace(/\s+/g, '_')}`;
                  try {
                    const url = await uploadImageToStorage(file, filename);
                    images.push(url);
                  } catch (err) {
                    console.error('Image upload failed for', file.name, err);
                  }
                }
              }

              if (images.length) payload.images = images;
            } catch (uploadErr) {
              console.error('Error uploading images', uploadErr);
            }

            try {
              const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  apikey: SUPABASE_ANON_KEY,
                  Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
                  Prefer: 'return=representation'
                },
                body: JSON.stringify(payload)
              });

              if (!res.ok) {
                console.error('Failed to save sell submission to Supabase', res.status, await res.text());
              } else {
                console.log('Sell submission saved to Supabase');
              }
            } catch (err) {
              console.error('Error saving sell submission to Supabase', err);
            }
          })();
        } catch (err) {
          console.error('Error preparing sell submission', err);
        }

        window.open(
          whatsappLink(message),
          "_blank"
        );

      }
    );

  }

});