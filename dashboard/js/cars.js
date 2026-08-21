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
                const filters = readSearchFilters();
                await fetchAndRenderCars(tableBody, filters);
            } finally {
                refreshBtn.disabled = false;
                refreshBtn.textContent = 'تحديث';
            }
        });
    }

    // Wire up search form
    const searchForm = document.getElementById('searchForm');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');

    if (searchForm) {
        // on submit
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const filters = readSearchFilters();
            searchBtn.disabled = true;
            searchBtn.textContent = 'جارٍ البحث...';
            try {
                await fetchAndRenderCars(tableBody, filters);
            } finally {
                searchBtn.disabled = false;
                searchBtn.textContent = 'بحث';
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('searchBrand').value = '';
            document.getElementById('searchModel').value = '';
            document.getElementById('searchCity').value = '';
            // reload full list
            fetchAndRenderCars(tableBody);
        });
    }

    // Debounced live search on inputs
    const inputs = ['searchBrand','searchModel','searchCity','filterStatus','filterFuel','filterTransmission']
        .map(id => document.getElementById(id)).filter(Boolean);
    if (inputs.length) {
        let debounceTimer = null;
        inputs.forEach(inp => {
            inp.addEventListener('input', () => {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(async () => {
                    const filters = readSearchFilters();
                    await fetchAndRenderCars(tableBody, filters);
                }, 400);
            });
        });
    }
});

async function fetchAndRenderCars(container, filters = {}) {
    showLoadingState(container);

    try {
        let query = window.supabase
            .from('cars')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters (brand, model, city) using case-insensitive partial matches
        if (filters.brand) {
            query = query.ilike('brand', `%${filters.brand}%`);
        }
        if (filters.model) {
            query = query.ilike('model', `%${filters.model}%`);
        }
        if (filters.city) {
            query = query.ilike('city', `%${filters.city}%`);
        }

        // Apply exact-match filters for status, fuel, transmission when provided
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.fuel) {
            query = query.eq('fuel', filters.fuel);
        }
        if (filters.transmission) {
            query = query.eq('transmission', filters.transmission);
        }

        const { data: cars, error } = await query;

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
                    <button class="btn btn-sm edit-btn" data-id="${escapeHtml(String(car.id))}">تعديل</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${escapeHtml(String(car.id))}">حذف</button>
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = rowsHtml;

    // Attach handlers (currently disabled behavior will be implemented in edit/delete phases)
    container.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', (e) => {
        e.preventDefault();
        alert('تحرير السيارة غير مفعّل بعد.');
    }));
    container.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', (e) => {
        e.preventDefault();
        alert('حذف السيارة غير مفعّل بعد.');
    }));
}

function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}