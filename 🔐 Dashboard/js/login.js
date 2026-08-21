document.addEventListener("DOMContentLoaded", () => {
  try {
    const supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const loginForm = document.getElementById("loginForm");
    const messageEl = document.getElementById("loginMessage");

    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        messageEl.textContent = "Connexion...";

        try {
          const { data, error } = await supa.auth.signInWithPassword({ email, password });

          if (error) {
            messageEl.textContent = `Erreur: ${error.message}`;
            console.error(error);
            return;
          }

          // On success redirect to dashboard
          window.location.href = "dashboard.html";

        } catch (err) {
          messageEl.textContent = "Erreur inattendue lors de la connexion.";
          console.error(err);
        }
      });
    }
  } catch (err) {
    console.error('Supabase client or configuration missing', err);
  }
});
