document.addEventListener('DOMContentLoaded', async () => {
    const carsGrid = document.getElementById('carsGrid') || document.getElementById('carsList');
    if (!carsGrid) return;

    await loadPublicCars(carsGrid);
});

async function loadPublicCars(container) {
    // التأكد من تهيئة Supabase Client الموحد
    if (!window.supabase || typeof window.supabase.from !== 'function') {
        console.error('Supabase client is not loaded.');
        container.innerHTML = '<p class="error-message">تعذر الاتصال بقاعدة البيانات حالياً.</p>';
        return;
    }

    container.innerHTML = '<p class="loading-message">جاري تحميل السيارات المتاحة...</p>';

    try {
        // استعلام قراءة SELECT فقط للسيارات المتاحة
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
    const defaultPlaceholder = 'https://via.placeholder.com/300x200?text=No+Image';

    const cardsHtml = cars.map(car => {
        const imageUrl = car.main_image && car.main_image.trim() !== '' 
            ? car.main_image 
            : defaultPlaceholder;

        return `
            <div class="car-card">
                <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(car.brand)} ${escapeHtml(car.model)}" class="car-image" />
                <div class="car-details">
                    <h3>${escapeHtml(car.brand)} ${escapeHtml(car.model)}</h3>
                    <p class="car-info">السنة: ${car.year || 'N/A'} | الوقود: ${escapeHtml(car.fuel || 'N/A')}</p>
                    <p class="car-price">الثمن: <strong>${car.price ? car.price.toLocaleString() : 0} MAD</strong></p>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = cardsHtml;
}

function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}