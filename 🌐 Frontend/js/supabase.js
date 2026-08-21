// Supabase Configuration
window.SUPABASE_URL = 'https://kdnwyemjbryypyfugkia.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkbnd5ZW1qYnJ5eXB5ZnVna2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMjg4NjEsImV4cCI6MjEwMjgwNDg2MX0.s98Fv7HOePzcsqH-vxqHY1BDd6IGNpgspf1mg9ICdSg';

// تهيئة Supabase Client مرة واحدة فقط وإتاحته على window.supabase
if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
} else if (!window.supabase || typeof window.supabase.from !== 'function') {
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

/**
 * دالة رفع الصور إلى Storage
 */
async function uploadImageToStorage(file) {
    if (!window.supabase || typeof window.supabase.storage !== 'function') {
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