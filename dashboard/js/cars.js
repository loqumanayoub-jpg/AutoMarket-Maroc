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
            showToast('تحرير السيارة غير مفعّل بعد.', 'info');
    }));
    container.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', (e) => {
        e.preventDefault();
            showToast('حذف السيارة غير مفعّل بعد.', 'info');
    }));
}

function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Read filters from search form and filter selects
function readSearchFilters() {
    return {
        brand: (document.getElementById('searchBrand') || {}).value?.trim() || '',
        model: (document.getElementById('searchModel') || {}).value?.trim() || '',
        city: (document.getElementById('searchCity') || {}).value?.trim() || '',
        status: (document.getElementById('filterStatus') || {}).value || '',
        fuel: (document.getElementById('filterFuel') || {}).value || '',
        transmission: (document.getElementById('filterTransmission') || {}).value || ''
    };
}

// Simple toast utility
function showToast(message, type = 'info', timeout = 4000) {
    try {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.textContent = message;
        container.appendChild(el);
        // force reflow to enable transition
        requestAnimationFrame(() => el.classList.add('show'));
        // remove after timeout
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 300);
        }, timeout);
    } catch (e) {
        console.warn('Toast failed', e);
    }
}

// ---------- Add Car Modal & Form Handling ----------
(function registerAddCarHandlers(){
    // Wait for DOM ready; this IIFE runs after file load but ensure elements exist
    document.addEventListener('DOMContentLoaded', () => {
        const addCarBtn = document.getElementById('addCarBtn');
        const addCarModal = document.getElementById('addCarModal');
        const addCarCancel = document.getElementById('addCarCancel');
        const addCarForm = document.getElementById('addCarForm');
        const addCarError = document.getElementById('addCarError');
        const addCarSubmit = document.getElementById('addCarSubmit');

        if (!addCarBtn || !addCarModal || !addCarForm) return;

        function showModal() { addCarModal.style.display = 'block'; }
        function hideModal() { addCarModal.style.display = 'none'; }

        addCarBtn.addEventListener('click', (e) => { e.preventDefault(); showModal(); });
        addCarCancel.addEventListener('click', (e) => { e.preventDefault(); hideModal(); });

        addCarForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (addCarError) { addCarError.style.display = 'none'; addCarError.textContent = ''; }

            // Prevent double submits
            if (addCarSubmit.disabled) return;
            addCarSubmit.disabled = true;
            addCarSubmit.textContent = 'جارٍ الحفظ...';

            try {
                // Collect values
                const brand = (document.getElementById('fieldBrand') || {}).value?.trim();
                const model = (document.getElementById('fieldModel') || {}).value?.trim();
                const year = parseInt((document.getElementById('fieldYear') || {}).value) || null;
                const priceRaw = (document.getElementById('fieldPrice') || {}).value;
                const price = priceRaw !== undefined && priceRaw !== '' ? priceRaw : null; // numeric as string
                const mileage = parseInt((document.getElementById('fieldMileage') || {}).value) || null;
                const fuel = (document.getElementById('fieldFuel') || {}).value?.trim() || null;
                const transmission = (document.getElementById('fieldTransmission') || {}).value?.trim() || null;
                const city = (document.getElementById('fieldCity') || {}).value?.trim() || null;
                const horsepower = parseInt((document.getElementById('fieldHorsepower') || {}).value) || null;
                const doors = parseInt((document.getElementById('fieldDoors') || {}).value) || null;
                const vignetteRaw = (document.getElementById('fieldVignette') || {}).value;
                const vignette = vignetteRaw !== undefined && vignetteRaw !== '' ? vignetteRaw : null;
                const description = (document.getElementById('fieldDescription') || {}).value?.trim() || null;
                const status = (document.getElementById('fieldStatus') || {}).value || null;
                const inspection_status = (document.getElementById('fieldInspection') || {}).value || null;
                const guarantee_months = parseInt((document.getElementById('fieldGuarantee') || {}).value) || 0;

                // Basic validation for required fields
                if (!brand || !model || !year || !price || !fuel || !transmission || !city) {
                    throw new Error('يرجى ملء الحقول المطلوبة: العلامة، النموذج، السنة، الثمن، الوقود، نقل الحركة، المدينة.');
                }

                // Upload main image if provided
                const mainInput = document.getElementById('fieldMainImage');
                let main_image_url = null;
                if (mainInput && mainInput.files && mainInput.files.length > 0) {
                    const mainFile = mainInput.files[0];
                    main_image_url = await uploadFileToStorage(mainFile);
                }

                // Upload gallery images if provided
                const galleryInput = document.getElementById('fieldGallery');
                let galleryUrls = [];
                if (galleryInput && galleryInput.files && galleryInput.files.length > 0) {
                    const files = Array.from(galleryInput.files);
                    for (const f of files) {
                        try {
                            const url = await uploadFileToStorage(f);
                            if (url) galleryUrls.push(url);
                        } catch (err) {
                            console.error('Gallery upload error for file', f.name, err);
                            // continue uploading others
                        }
                    }
                }

                // Prepare insert payload matching real schema
                const payload = {
                    brand,
                    model,
                    year: year,
                    price: price,
                    mileage: mileage || 0,
                    fuel,
                    transmission,
                    city,
                    horsepower: horsepower || null,
                    doors: doors || 5,
                    vignette: vignette !== null ? vignette : null,
                    description: description || null,
                    main_image: main_image_url,
                    gallery: galleryUrls.length ? galleryUrls : [],
                    status: status || 'available',
                    inspection_status: inspection_status || 'pending',
                    guarantee_months: guarantee_months || 0
                };

                // Insert into Supabase
                const { data, error } = await window.supabase
                    .from('cars')
                    .insert([payload]);

                if (error) {
                    console.error('Insert error:', error);
                    throw new Error(error.message || 'خطأ أثناء إضافة السيارة.');
                }

                // Success: refresh table and close modal
                await fetchAndRenderCars(document.getElementById('carsTableBody'));
                showToast('تمت إضافة السيارة بنجاح.', 'success');
                hideModal();
                addCarForm.reset();

            } catch (err) {
                console.error('Add car failed:', err);
                if (addCarError) {
                    addCarError.textContent = err.message || 'حدث خطأ أثناء إضافة السيارة.';
                    addCarError.style.display = 'block';
                }
                showToast(err.message || 'حدث خطأ أثناء إضافة السيارة.', 'error');
            } finally {
                addCarSubmit.disabled = false;
                addCarSubmit.textContent = 'حفظ';
            }
        });
    });

    // Helper: upload a File object to car-images and return public URL
    async function uploadFileToStorage(file) {
        if (!file) return null;
        if (!window.supabase || !window.supabase.storage) throw new Error('Supabase storage is not available.');

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2,9)}.${fileExt}`;
        const filePath = `cars/${fileName}`;

        // Upload
        const { data, error } = await window.supabase.storage
            .from('car-images')
            .upload(filePath, file);

        if (error) {
            console.error('Storage upload error:', error);
            throw new Error('فشل رفع الصورة.');
        }

        // Get public URL
        const { data: publicUrlData } = window.supabase.storage
            .from('car-images')
            .getPublicUrl(filePath);

        return publicUrlData ? publicUrlData.publicUrl : null;
    }
})();