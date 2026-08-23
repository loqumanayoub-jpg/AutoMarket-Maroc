// Supabase Configuration
window.SUPABASE_URL = 'https://kdnwyemjbryypyfugkia.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkbnd5ZW1qYnJ5eXB5ZnVna2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMjg4NjEsImV4cCI6MjEwMjgwNDg2MX0.s98Fv7HOePzcsqH-vxqHY1BDd6IGNpgspf1mg9ICdSg';

// Initialize the browser SDK once and expose a usable client on window.supabase.
const supabaseBrowserSdk = window.supabase || globalThis.supabase;

if (supabaseBrowserSdk && typeof supabaseBrowserSdk.createClient === 'function') {
    window.supabase = supabaseBrowserSdk.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
} else {
    console.error('Supabase CDN library is missing or invalid.');
}

/**
 * دالة جلب السيارات المتاحة للـ Frontend
 */
async function getCarsFromSupabase() {
    if (!window.supabase || typeof window.supabase.from !== 'function') {
        console.error('Supabase client is not initialized.');
        return [];
    }

    try {
        const { data, error } = await window.supabase
            .from('cars')
            .select('*')
            .eq('status', 'available')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching cars:', error.message);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Unexpected error in getCarsFromSupabase:', err);
        return [];
    }
}

function resolvePublicImageUrl(value, fallback = 'images/placeholder.svg') {
    if (!value || typeof value !== 'string') {
        return fallback;
    }

    const imageValue = value.trim();
    if (!imageValue) {
        return fallback;
    }

    if (/^https?:\/\//i.test(imageValue) || imageValue.startsWith('data:')) {
        return imageValue;
    }

    try {
        if (window.supabase && window.supabase.storage && typeof window.supabase.storage.from === 'function') {
            const { data } = window.supabase.storage.from('car-images').getPublicUrl(imageValue);
            if (data && data.publicUrl) {
                return data.publicUrl;
            }
        }
    } catch (err) {
        console.warn('Unable to resolve Supabase image URL:', err);
    }

    return fallback;
}

window.resolvePublicImageUrl = resolvePublicImageUrl;

/**
 * دالة رفع الصور إلى Storage
 */
async function uploadImageToStorage(file) {
    if (!window.supabase || !window.supabase.storage || typeof window.supabase.storage.from !== 'function') {
        throw new Error('Supabase client is not initialized.');
    }

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `cars/${fileName}`;

        const { data, error } = await window.supabase.storage
            .from('car-images')
            .upload(filePath, file);

        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }

        const { data: publicUrlData } = window.supabase.storage
            .from('car-images')
            .getPublicUrl(filePath);

        return publicUrlData ? publicUrlData.publicUrl : null;
    } catch (err) {
        console.error('Error in uploadImageToStorage:', err);
        throw err;
    }
}