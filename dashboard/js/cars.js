document.addEventListener('DOMContentLoaded', async () => {
    const pendingEditId = Number(localStorage.getItem('am_dashboard_edit_car_id') || 0);
    if (pendingEditId) {
        localStorage.removeItem('am_dashboard_edit_car_id');
    }

    const tableBody = document.getElementById('carsTableBody');
    const refreshBtn = document.getElementById('refreshBtn');
    if (!tableBody) return;

    if (!window.supabase || typeof window.supabase.from !== 'function') {
        console.error('Supabase client is not loaded in cars.js');
        showErrorState(tableBody, 'فشل الاتصال بقاعدة البيانات.');
        return;
    }

    await populateFuelFilter();

    // Initial load
    await fetchAndRenderCars(tableBody);

    if (pendingEditId) {
        setTimeout(() => {
            if (typeof openEditCarModal === 'function') {
                openEditCarModal(pendingEditId);
            }
        }, 150);
    }

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
        clearBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            resetSearchFilters();
            await fetchAndRenderCars(tableBody, {});
        });
    }

    // Debounced live search on inputs and select changes
    const inputs = ['searchBrand','searchModel','searchCity','filterStatus','filterFuel','filterTransmission']
        .map(id => document.getElementById(id)).filter(Boolean);
    if (inputs.length) {
        let debounceTimer = null;
        inputs.forEach(inp => {
            const runLiveSearch = async () => {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(async () => {
                    const filters = readSearchFilters();
                    await fetchAndRenderCars(tableBody, filters);
                }, 400);
            };

            inp.addEventListener('input', runLiveSearch);
            inp.addEventListener('change', runLiveSearch);
        });
    }
});

async function populateFuelFilter() {
    const filter = document.getElementById('filterFuel');
    if (!filter || !window.supabase || typeof window.supabase.from !== 'function') return;

    const { data, error } = await window.supabase.from('cars').select('fuel');
    if (error || !Array.isArray(data)) return;

    const fuels = [...new Set(data.map((car) => String(car.fuel || '').trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));
    filter.replaceChildren(new Option('وقود - الكل', ''));
    fuels.forEach((fuel) => filter.add(new Option(fuel, fuel)));
}

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
    const defaultPlaceholder = '../🌐 Frontend/images/placeholder.svg';

    const rowsHtml = cars.map(car => {
        const imageUrl = resolvePublicImageUrl(car.main_image, defaultPlaceholder);

        return `
            <tr>
                <td><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(car.brand || '')} ${escapeHtml(car.model || '')}" style="width:70px; height:50px; object-fit:cover; border-radius:4px;" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='../🌐 Frontend/images/placeholder.svg';" /></td>
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

    // Attach handlers
    container.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', async (e) => {
        e.preventDefault();
            const carId = Number(b.dataset.id);
            if (!carId) {
                showToast('تعذر تحديد السيارة.', 'error');
                return;
            }
            await openEditCarModal(carId);
    }));
    // Delete handlers: show confirmation modal and perform DELETE preserving filters
    container.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', (e) => {
            e.preventDefault();
            const carId = Number(b.dataset.id);
            if (!carId) { showToast('تعذر تحديد السيارة للحذف.', 'error'); return; }

            // populate and show delete modal
            const modal = document.getElementById('deleteConfirmModal');
            const title = document.getElementById('deleteConfirmTitle');
            const text = document.getElementById('deleteConfirmText');
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            const cancelBtn = document.getElementById('cancelDeleteBtn');

            // try to get a friendly car label
            const brand = b.closest('tr')?.querySelector('td:nth-child(2)')?.textContent?.trim() || `#${carId}`;
            if (title) title.textContent = `حذف ${brand}`;
            if (text) text.textContent = 'هل أنت متأكد أنك تريد حذف هذه السيارة؟ لا يمكن التراجع عن هذا الإجراء.';

            function cleanup() {
                if (confirmBtn) confirmBtn.onclick = null;
                if (cancelBtn) cancelBtn.onclick = null;
                if (modal) modal.style.display = 'none';
            }

            if (cancelBtn) cancelBtn.onclick = function(ev) { ev.preventDefault(); cleanup(); };

            if (confirmBtn) {
                confirmBtn.onclick = async function(ev) {
                    ev.preventDefault();
                    try {
                        confirmBtn.disabled = true;
                        confirmBtn.textContent = 'جارٍ الحذف...';

                        // perform delete via Supabase respecting RLS
                        const { error } = await window.supabase
                            .from('cars')
                            .delete()
                            .eq('id', carId);

                        if (error) {
                            console.error('Delete error:', error);
                            showToast('فشل حذف السيارة: ' + (error.message || 'خطأ في الخادم'), 'error');
                        } else {
                            showToast('تم حذف السيارة بنجاح.', 'success');
                            // refresh using current filters
                            const filters = readSearchFilters();
                            await fetchAndRenderCars(document.getElementById('carsTableBody'), filters);
                        }
                    } catch (err) {
                        console.error('Delete failed:', err);
                        showToast('حدث خطأ أثناء حذف السيارة.', 'error');
                    } finally {
                        confirmBtn.disabled = false;
                        if (confirmBtn) confirmBtn.textContent = 'حذف';
                        cleanup();
                    }
                };
            }

            if (modal) modal.style.display = 'block';
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

function resetSearchFilters() {
    const formFields = [
        'searchBrand',
        'searchModel',
        'searchCity',
        'filterStatus',
        'filterFuel',
        'filterTransmission'
    ];

    formFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
        }
    });
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

function setModalMode(mode, carData = null) {
    const addCarForm = document.getElementById('addCarForm');
    const addCarTitle = document.getElementById('addCarTitle');
    const addCarSubmit = document.getElementById('addCarSubmit');
    const addCarError = document.getElementById('addCarError');
    if (!addCarForm) return;

    const isEdit = mode === 'edit';
    addCarForm.dataset.mode = mode;
    addCarForm.dataset.carId = carData ? String(carData.id) : '';
    if (addCarTitle) {
        addCarTitle.textContent = isEdit ? 'تعديل السيارة' : 'إضافة سيارة جديدة';
    }
    if (addCarSubmit) {
        addCarSubmit.textContent = isEdit ? 'حفظ التغييرات' : 'حفظ';
    }
    if (addCarError) {
        addCarError.style.display = 'none';
        addCarError.textContent = '';
    }
    if (isEdit && carData) {
        fillFormFromCar(carData);
    } else {
        addCarForm.reset();
    }
}

function fillFormFromCar(car) {
    const fields = {
        fieldBrand: car.brand || '',
        fieldModel: car.model || '',
        fieldYear: car.year || '',
        fieldPrice: car.price || '',
        fieldMileage: car.mileage || '',
        fieldFuel: car.fuel || '',
        fieldTransmission: car.transmission || '',
        fieldCity: car.city || '',
        fieldHorsepower: car.horsepower || '',
        fieldDoors: car.doors || '',
        fieldVignette: car.vignette || '',
        fieldDescription: car.description || '',
        fieldStatus: car.status || 'available',
        fieldInspection: car.inspection_status || 'pending',
        fieldGuarantee: car.guarantee_months || 0
    };
    Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    });
}

async function openEditCarModal(carId) {
    const addCarForm = document.getElementById('addCarForm');
    const addCarModal = document.getElementById('addCarModal');
    if (!addCarForm || !addCarModal) return;

    try {
        const { data, error } = await window.supabase
            .from('cars')
            .select('*')
            .eq('id', carId)
            .single();

        if (error || !data) {
            showToast('تعذر تحميل بيانات السيارة.', 'error');
            return;
        }

        addCarForm.dataset.mode = 'edit';
        addCarForm.dataset.carId = String(data.id);
        setModalMode('edit', data);
        addCarModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } catch (err) {
        console.error('Open edit modal failed:', err);
        showToast('تعذر فتح نموذج تعديل السيارة.', 'error');
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

        function showModal() {
            addCarModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        function hideModal() {
            addCarModal.style.display = 'none';
            document.body.style.overflow = '';
        }

        addCarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            setModalMode('add');
            showModal();
        });
        addCarCancel.addEventListener('click', (e) => {
            e.preventDefault();
            addCarForm.reset();
            setModalMode('add');
            hideModal();
        });

        addCarModal.addEventListener('click', (e) => {
            if (e.target === addCarModal) {
                addCarForm.reset();
                setModalMode('add');
                hideModal();
            }
        });

        addCarForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (addCarError) { addCarError.style.display = 'none'; addCarError.textContent = ''; }

            // Prevent double submits
            if (addCarSubmit.disabled) return;
            addCarSubmit.disabled = true;
            addCarSubmit.textContent = 'جارٍ الحفظ...';

            const isEditMode = addCarForm.dataset.mode === 'edit';
            const carId = Number(addCarForm.dataset.carId || 0);

            try {
                const payload = await buildCarPayloadFromForm();

                if (isEditMode) {
                    if (!carId) {
                        throw new Error('تعذر تحديد السيارة المراد تعديلها.');
                    }

                    // Ensure user is authenticated before attempting update (avoids RLS rejection)
                    try {
                        const sessionResp = await window.supabase.auth.getSession();
                        const session = sessionResp?.data?.session;
                        if (!session || !session.user) {
                            showToast('الرجاء تسجيل الدخول لإجراء التغييرات.', 'error');
                            // brief delay so user sees toast, then redirect to login
                            setTimeout(() => window.location.replace('login.html'), 900);
                            return;
                        }
                    } catch (e) {
                        console.warn('Failed to verify session before update', e);
                        showToast('حالة المصادقة غير معروفة. الرجاء إعادة تسجيل الدخول.', 'error');
                        setTimeout(() => window.location.replace('login.html'), 900);
                        return;
                    }

                    const { error } = await window.supabase
                        .from('cars')
                        .update({ ...payload, updated_at: new Date().toISOString() })
                        .eq('id', carId);
                    if (error) {
                        console.error('Update error:', error);
                        throw new Error(error.message || 'خطأ أثناء تحديث السيارة.');
                    }
                    await fetchAndRenderCars(document.getElementById('carsTableBody'));
                    showToast('تم تحديث السيارة بنجاح.', 'success');
                } else {
                    // Ensure user is authenticated before attempting insert (RLS requires authenticated)
                    try {
                        const sessionResp = await window.supabase.auth.getSession();
                        const session = sessionResp?.data?.session;
                        if (!session || !session.user) {
                            showToast('الرجاء تسجيل الدخول لإضافة سيارة جديدة.', 'error');
                            setTimeout(() => window.location.replace('login.html'), 900);
                            return;
                        }
                    } catch (e) {
                        console.warn('Failed to verify session before insert', e);
                        showToast('حالة المصادقة غير معروفة. الرجاء إعادة تسجيل الدخول.', 'error');
                        setTimeout(() => window.location.replace('login.html'), 900);
                        return;
                    }

                    const { error } = await window.supabase
                        .from('cars')
                        .insert([payload]);

                    if (error) {
                        console.error('Insert error:', error);
                        throw new Error(error.message || 'خطأ أثناء إضافة السيارة.');
                    }
                    await fetchAndRenderCars(document.getElementById('carsTableBody'));
                    showToast('تمت إضافة السيارة بنجاح.', 'success');
                }

                addCarForm.reset();
                setModalMode('add');
                hideModal();

            } catch (err) {
                console.error('Car form failed:', err);
                if (addCarError) {
                    addCarError.textContent = err.message || 'حدث خطأ أثناء حفظ السيارة.';
                    addCarError.style.display = 'block';
                }
                showToast(err.message || 'حدث خطأ أثناء حفظ السيارة.', 'error');
            } finally {
                addCarSubmit.disabled = false;
                addCarSubmit.textContent = isEditMode ? 'حفظ التغييرات' : 'حفظ';
            }
        });
    });

    async function buildCarPayloadFromForm() {
        // Collect values
        const brand = (document.getElementById('fieldBrand') || {}).value?.trim();
        const model = (document.getElementById('fieldModel') || {}).value?.trim();
        const year = parseInt((document.getElementById('fieldYear') || {}).value) || null;
        const priceRaw = (document.getElementById('fieldPrice') || {}).value;
        const price = priceRaw !== undefined && priceRaw !== '' ? priceRaw : null;
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

        if (!brand || !model || !year || !price || !fuel || !transmission || !city) {
            throw new Error('يرجى ملء الحقول المطلوبة: العلامة، النموذج، السنة، الثمن، الوقود، نقل الحركة، المدينة.');
        }

        const mainInput = document.getElementById('fieldMainImage');
        const galleryInput = document.getElementById('fieldGallery');

        let main_image_url = null;
        if (mainInput && mainInput.files && mainInput.files.length > 0) {
            main_image_url = await uploadFileToStorage(mainInput.files[0]);
        }

        let galleryUrls = [];
        if (galleryInput && galleryInput.files && galleryInput.files.length > 0) {
            const files = Array.from(galleryInput.files);
            for (const f of files) {
                try {
                    const url = await uploadFileToStorage(f);
                    if (url) galleryUrls.push(url);
                } catch (err) {
                    console.error('Gallery upload error for file', f.name, err);
                }
            }
        }

        const mode = (document.getElementById('addCarForm') || {}).dataset?.mode || 'add';
        const existingCarId = Number((document.getElementById('addCarForm') || {}).dataset?.carId || 0);
        let currentMainImage = null;
        let currentGallery = [];
        if (mode === 'edit' && existingCarId) {
            const existingRes = await window.supabase
                .from('cars')
                .select('main_image,gallery')
                .eq('id', existingCarId)
                .single();
            if (!existingRes.error && existingRes.data) {
                currentMainImage = existingRes.data.main_image || null;
                currentGallery = Array.isArray(existingRes.data.gallery) ? existingRes.data.gallery : [];
            }
        }

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
            main_image: main_image_url || currentMainImage || null,
            gallery: galleryUrls.length ? galleryUrls : currentGallery,
            status: status || 'available',
            inspection_status: inspection_status || 'pending',
            guarantee_months: guarantee_months || 0
        };

        return payload;
    }

    async function uploadFileToStorage(file) {
        if (!file) return null;

        if (!window.supabase || !window.supabase.storage) {
            throw new Error('Supabase storage is not available.');
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            throw new Error('نوع الصورة غير مسموح. استعمل JPG أو PNG أو WEBP.');
        }

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            throw new Error('حجم الصورة خاصو ما يفوتش 5MB.');
        }

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