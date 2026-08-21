// auth.js — protect dashboard pages
try {
  const supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  (async () => {
    const session = await supa.auth.getSession();
    if (!session || !session.data?.session) {
      // Not authenticated
      window.location.href = "login.html";
    }
  })();
} catch (err) {
  console.error('Auth check failed', err);
}
