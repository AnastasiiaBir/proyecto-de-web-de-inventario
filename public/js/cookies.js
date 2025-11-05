document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("cookie-banner");
  const acceptAll = document.getElementById("accept-all");
  const rejectAll = document.getElementById("reject-all");
  const customize = document.getElementById("customize");
  const settings = document.getElementById("cookie-settings");
  const savePrefs = document.getElementById("save-preferences");

  // Если уже есть выбор — не показываем баннер
  if (localStorage.getItem("cookieConsent")) {
    banner.style.display = "none";
    return;
  }

  banner.style.display = "block";

  acceptAll.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "all");
    banner.style.display = "none";
  });

  rejectAll.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "none");
    banner.style.display = "none";
  });

  customize.addEventListener("click", () => {
    settings.style.display = "block";
  });

  savePrefs.addEventListener("click", () => {
    const analytics = document.getElementById("analytics").checked;
    const marketing = document.getElementById("marketing").checked;
    const prefs = { analytics, marketing };
    localStorage.setItem("cookieConsent", JSON.stringify(prefs));
    settings.style.display = "none";
    banner.style.display = "none";
  });
});
