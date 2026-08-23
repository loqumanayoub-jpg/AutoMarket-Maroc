if (typeof window !== 'undefined') {
    window.CARS_DATA = Array.isArray(window.CARS_DATA) ? window.CARS_DATA : [];
}

if (typeof globalThis !== 'undefined') {
    globalThis.CARS_DATA = Array.isArray(globalThis.CARS_DATA) ? globalThis.CARS_DATA : window.CARS_DATA;
}

async function ensureCarsData() {
    if (Array.isArray(window.CARS_DATA) && window.CARS_DATA.length) {
        globalThis.CARS_DATA = window.CARS_DATA;
        return window.CARS_DATA;
    }

    try {
        const cars = await getCarsFromSupabase();
        const safeCars = Array.isArray(cars) ? cars : [];
        window.CARS_DATA = safeCars;
        globalThis.CARS_DATA = safeCars;
        if (typeof CARS_DATA !== 'undefined') {
            CARS_DATA = safeCars;
        }
        return safeCars;
    } catch (error) {
        console.error('Front-end car data sync failed:', error);
        const safeCars = [];
        window.CARS_DATA = safeCars;
        globalThis.CARS_DATA = safeCars;
        if (typeof CARS_DATA !== 'undefined') {
            CARS_DATA = safeCars;
        }
        return safeCars;
    }
}

window.ensureCarsData = ensureCarsData;

if (typeof globalThis !== 'undefined') {
    globalThis.ensureCarsData = ensureCarsData;
}

document.addEventListener('DOMContentLoaded', async () => {
    await ensureCarsData();
});

async function loadPublicCars(container) {
    if (!window.supabase || typeof window.supabase.from !== 'function') {
        console.error('Supabase client is not loaded.');
        container.innerHTML = '<p class="error-message">تعذر الاتصال بقاعدة البيانات حالياً.</p>';
        return;
    }

    container.innerHTML = '<p class="loading-message">جاري تحميل السيارات المتاحة...</p>';

    try {
        const { data: cars, error } = await window.supabase
            .from('cars')
            .select('*')
            .eq('status', 'available')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching cars:', error.message);
            container.innerHTML = '<p class="error-message">حدث خطأ أثناء جلب البيانات.</p>';
            return;
        }

        if (!cars || cars.length === 0) {
            container.innerHTML = '<p class="empty-message">لا توجد سيارات معروضة للبيع حالياً.</p>';
            return;
        }

        renderPublicCarsCards(container, cars);

    } catch (err) {
        console.error('Unexpected error:', err);
        container.innerHTML = '<p class="error-message">حدث خطأ غير متوقع.</p>';
    }
}

function renderPublicCarsCards(container, cars) {
    const defaultPlaceholder = 'images/placeholder.svg';

    const cardsHtml = cars.map(car => {
        const imageUrl = resolvePublicImageUrl(car.main_image, defaultPlaceholder);

        return `
            <article class="car-card">
                <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(car.brand)} ${escapeHtml(car.model)}" class="car-image" loading="lazy" decoding="async" />
                <div class="car-details">
                    <h3>${escapeHtml(car.brand)} ${escapeHtml(car.model)}</h3>
                    <p class="car-info">السنة: ${car.year || 'N/A'} | الوقود: ${escapeHtml(car.fuel || 'N/A')}</p>
                    <p class="car-price">الثمن: <strong>${car.price ? car.price.toLocaleString() : 0} MAD</strong></p>
                    <a href="car-details.html?id=${car.id}" class="btn btn-primary">Voir détails</a>
                </div>
            </article>
        `;
    }).join('');

    container.innerHTML = cardsHtml;
}

function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}