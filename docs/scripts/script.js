const Storage = {

  // default values auto-created if missing
  defaults: {
    progress: {
      internet: 0,
      network: 0,
      uiux: 0
    },

    "last-quiz": {
      lesson: null,
      question: 0
    }
  },

  // Save any value (auto JSON)
  set(key, value) {

    try {

      const data = JSON.stringify(value);

      localStorage.setItem(key, data);

      return true;

    } catch (err) {

      console.error("Storage set error:", err);

      return false;

    }

  },

  // Read value (auto JSON parse)
  get(key, fallback = null) {

    try {

      const data = localStorage.getItem(key);

      // =========================
      // AUTO CREATE IF MISSING
      // =========================

      if (data === null) {

        // use fallback first
        if (fallback !== null) {

          this.set(key, fallback);

          return fallback;

        }

        // otherwise use defaults
        if (this.defaults[key] !== undefined) {

          this.set(key, this.defaults[key]);

          return this.defaults[key];

        }

        return null;

      }

      return JSON.parse(data);

    } catch (err) {

      console.error("Storage get error:", err);

      return fallback;

    }

  },

  // Remove one key
  remove(key) {

    localStorage.removeItem(key);

  },

  // Clear everything
  clear() {

    localStorage.clear();

  },

  // Check if key exists
  has(key) {

    return localStorage.getItem(key) !== null;

  }

};

function wipMessage() {
  alert("Work in progress");
}

// Service Worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.log('Service Worker failed:', err));
  });
}