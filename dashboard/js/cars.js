document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('carsTableBody');
    const refreshBtn = document.getElementById('refreshBtn');
    if (!tableBody) return;

    if (!window.supabase || typeof window.supabase.from !== 'function') {
        console.error('Supabase client is not loaded in cars.js');
        showErrorState(tableBody, 'فشل الاتصال بقاعدة البيانات.');
        return;
    }

    // Initial load
    await fetchAndRenderCars(tableBody);

    // Wire up refresh button if present
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            refreshBtn.disabled = true;
            refreshBtn.textContent = 'جاري التحديث...';
            try {
                await fetchAndRenderCars(tableBody);
            } finally {
                refreshBtn.disabled = false;
                refreshBtn.textContent = 'تحديث';
            }
        });
    }
});

async function fetchAndRenderCars(container) {
    showLoadingState(container);

    try {
        const { data: cars, error } = await window.supabase
            .from('cars')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Query Error:', error.message);
            showErrorState(container, 'تعذر جلب بيانات السيارات من الخادم.');
            return;
        }

        if (!cars || cars.length === 0) {
            showEmptyState(container);
            return;
        }

        renderCarsTable(container, cars);

    } catch (err) {
        console.error('Unexpected Error:', err);
        showErrorState(container, 'حدث خطأ غير متوقع أثناء تحميل البيانات.');
    }
}

function showLoadingState(container) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem;">جاري تحميل السيارات...</td></tr>`;
}

function showEmptyState(container) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem;">لا توجد سيارات مسجلة حالياً.</td></tr>`;
}

function showErrorState(container, message) {
    if (!container) return;
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:red;">${escapeHtml(message)}</td></tr>`;
}

function renderCarsTable(container, cars) {
    const defaultPlaceholder = 'https://via.placeholder.com/80x60?text=No+Image';

    const rowsHtml = cars.map(car => {
        const imageUrl = car.main_image && car.main_image.trim() !== '' 
            ? car.main_image 
            : defaultPlaceholder;

        return `
            <tr>
                <td><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(car.brand || '')} ${escapeHtml(car.model || '')}" style="width:70px; height:50px; object-fit:cover; border-radius:4px;" /></td>
                <td><strong>${escapeHtml(car.brand || '')} ${escapeHtml(car.model || '')}</strong></td>
                <td>${car.year || 'N/A'}</td>
                <td>${car.price ? Number(car.price).toLocaleString() : 0} MAD</td>
                <td><span class="badge">${escapeHtml(car.status || 'available')}</span></td>
                <td>
                    <button class="btn btn-sm" disabled title="غير متاح حالياً">تعديل</button>
                    <button class="btn btn-sm btn-danger" disabled title="غير متاح حالياً">حذف</button>
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = rowsHtml;
}

function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}