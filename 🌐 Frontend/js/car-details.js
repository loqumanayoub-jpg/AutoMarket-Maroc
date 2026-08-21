/* =====================================================
   AutoMarket Maroc - Car Details
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const container =
      document.getElementById(
        "carDetails"
      );


    const params =
      new URLSearchParams(
        window.location.search
      );


    const carId =
      params.get("id");


    const car =
      CARS_DATA.find(
        item => item.id === carId
      );


    const whatsappNumber =
      String(CONFIG.whatsapp)
        .replace(/\D/g, "");


    function whatsappLink(message) {

      return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    }


    /* ================= NOT FOUND ================= */

    if (!car) {

      container.innerHTML = `

        <div class="details-not-found">

          <h1>Véhicule introuvable</h1>

          <p>
            Cette voiture n'existe pas ou
            n'est plus disponible.
          </p>

          <a
            href="index.html#cars"
            class="btn btn-primary"
          >
            Retour aux voitures
          </a>

        </div>

      `;

      return;

    }


    /* ================= GALLERY ================= */

    const gallery =
      car.gallery?.length
        ? car.gallery
        : [car.image];


    let currentImage = 0;


    /* ================= HTML ================= */

    container.innerHTML = `

      <div class="details-gallery">

        <img
          id="mainCarImage"
          class="main-image"
          src="${gallery[0]}"
          alt="${car.brand} ${car.model}"
        >


        <div class="gallery-controls">

          <button
            id="prevImage"
            class="gallery-btn"
            type="button"
          >
            ←
          </button>


          <div
            id="thumbnails"
            class="thumbnails"
          ></div>


          <button
            id="nextImage"
            class="gallery-btn"
            type="button"
          >
            →
          </button>

        </div>

      </div>


      <div class="details-info">

        <div class="details-badges">

          <span class="badge ${car.badge}">
            ${car.badgeText}
          </span>

          <span class="badge">
            ✓ ${car.inspectionStatus}
          </span>

        </div>


        <h1>
          ${car.brand} ${car.model}
        </h1>


        <span class="details-year">
          Année ${car.year} · ${car.city}
        </span>


        <div class="details-price">
          ${formatPrice(car.price)}
        </div>


        <p class="details-description">
          ${car.description}
        </p>


        <table class="spec-table">

          <tr>
            <td>🚗 Marque</td>
            <td>${car.brand}</td>
          </tr>

          <tr>
            <td>📅 Année</td>
            <td>${car.year}</td>
          </tr>

          <tr>
            <td>⛽ Carburant</td>
            <td>${car.fuel}</td>
          </tr>

          <tr>
            <td>⚙️ Boîte</td>
            <td>${car.transmission}</td>
          </tr>

          <tr>
            <td>🛣️ Kilométrage</td>
            <td>${formatMileage(car.mileage)}</td>
          </tr>

          <tr>
            <td>🔧 Moteur</td>
            <td>${car.engine}</td>
          </tr>

          <tr>
            <td>⚡ Puissance</td>
            <td>${car.horsepower} Ch</td>
          </tr>

          <tr>
            <td>🚪 Portes</td>
            <td>${car.doors}</td>
          </tr>

          <tr>
            <td>🧾 Vignette</td>
            <td>${car.vignette}</td>
          </tr>

          <tr>
            <td>🛡️ Garantie</td>
            <td>${car.guaranteeStatus}</td>
          </tr>

        </table>


        <div class="details-actions">

          <a
            id="detailsWhatsApp"
            href="#"
            target="_blank"
            rel="noopener"
            class="btn btn-whatsapp"
          >
            💬 WhatsApp
          </a>


          <a
            href="tel:${CONFIG.phone}"
            class="btn btn-primary"
          >
            📞 Appeler
          </a>

        </div>


        <!-- FINANCE CALCULATOR -->

        <div class="finance-card">

          <h3>
            💳 Calculer votre financement
          </h3>

          <div class="finance-grid">

            <div class="input-group">

              <label for="financeDeposit">
                Apport (MAD)
              </label>

              <input
                id="financeDeposit"
                type="number"
                min="0"
                value="20000"
              >

            </div>


            <div class="input-group">

              <label for="financeRate">
                Taux annuel (%)
              </label>

              <input
                id="financeRate"
                type="number"
                min="0"
                step="0.1"
                value="6"
              >

            </div>


            <div class="input-group">

              <label for="financeYears">
                Durée (années)
              </label>

              <select id="financeYears">

                <option value="2">
                  2 ans
                </option>

                <option value="3" selected>
                  3 ans
                </option>

                <option value="4">
                  4 ans
                </option>

                <option value="5">
                  5 ans
                </option>

                <option value="6">
                  6 ans
                </option>

                <option value="7">
                  7 ans
                </option>

              </select>

            </div>

          </div>


          <div class="finance-result">

            <span>
              Mensualité estimée
            </span>

            <strong id="monthlyPayment">
              0 MAD
            </strong>

          </div>

        </div>

      </div>

    `;


    /* ================= FORMAT ================= */

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


    /* ================= GALLERY ================= */

    const mainImage =
      document.getElementById(
        "mainCarImage"
      );

    const thumbnails =
      document.getElementById(
        "thumbnails"
      );


    function renderThumbnails() {

      thumbnails.innerHTML = "";


      gallery.forEach(
        (image, index) => {

          const img =
            document.createElement("img");

          img.src = image;

          img.className =
            "thumbnail" +
            (
              index === currentImage
                ? " active"
                : ""
            );

          img.alt =
            `Photo ${index + 1}`;


          img.addEventListener(
            "click",
            () => {

              setImage(index);

            }
          );


          thumbnails.appendChild(img);

        }
      );

    }


    function setImage(index) {

      if (index < 0) {
        index = gallery.length - 1;
      }

      if (index >= gallery.length) {
        index = 0;
      }


      currentImage = index;

      mainImage.src =
        gallery[currentImage];


      renderThumbnails();

    }


    document
      .getElementById("prevImage")
      .addEventListener(
        "click",
        () => {

          setImage(
            currentImage - 1
          );

        }
      );


    document
      .getElementById("nextImage")
      .addEventListener(
        "click",
        () => {

          setImage(
            currentImage + 1
          );

        }
      );


    renderThumbnails();


    /* ================= WHATSAPP ================= */

    const detailsWhatsApp =
      document.getElementById(
        "detailsWhatsApp"
      );


    detailsWhatsApp.href =
      whatsappLink(
        `Bonjour AutoMarket Maroc, je suis intéressé par la ${car.brand} ${car.model} ${car.year} affichée à ${formatPrice(car.price)}.`
      );


    const headerWhatsApp =
      document.getElementById(
        "detailsWhatsappHeader"
      );


    if (headerWhatsApp) {

      headerWhatsApp.href =
        whatsappLink(
          `Bonjour AutoMarket Maroc, je souhaite avoir des informations sur la ${car.brand} ${car.model}.`
        );

    }


    const footerWhatsApp =
      document.getElementById(
        "detailsFooterWhatsapp"
      );


    if (footerWhatsApp) {

      footerWhatsApp.href =
        whatsappLink(
          "Bonjour AutoMarket Maroc."
        );

    }


    /* ================= FINANCE ================= */

    const depositInput =
      document.getElementById(
        "financeDeposit"
      );

    const rateInput =
      document.getElementById(
        "financeRate"
      );

    const yearsInput =
      document.getElementById(
        "financeYears"
      );

    const monthlyOutput =
      document.getElementById(
        "monthlyPayment"
      );


    function calculateFinance() {

      const deposit =
        Math.max(
          0,
          Number(
            depositInput.value
          ) || 0
        );


      const annualRate =
        Math.max(
          0,
          Number(
            rateInput.value
          ) || 0
        );


      const years =
        Number(
          yearsInput.value
        );


      const principal =
        Math.max(
          0,
          car.price - deposit
        );


      if (principal <= 0) {

        monthlyOutput.textContent =
          "0 MAD";

        return;

      }


      const months =
        years * 12;


      const monthlyRate =
        annualRate / 100 / 12;


      let payment;


      if (monthlyRate === 0) {

        payment =
          principal / months;

      } else {

        payment =
          principal *
          (
            monthlyRate *
            Math.pow(
              1 + monthlyRate,
              months
            )
          ) /
          (
            Math.pow(
              1 + monthlyRate,
              months
            ) - 1
          );

      }


      monthlyOutput.textContent =
        formatPrice(
          Math.round(payment)
        );

    }


    [
      depositInput,
      rateInput,
      yearsInput
    ].forEach(
      element => {

        element.addEventListener(
          "input",
          calculateFinance
        );

        element.addEventListener(
          "change",
          calculateFinance
        );

      }
    );


    calculateFinance();


    /* ================= YEAR ================= */

    const detailsYear =
      document.getElementById(
        "detailsYear"
      );


    if (detailsYear) {

      detailsYear.textContent =
        new Date().getFullYear();

    }

  }
);