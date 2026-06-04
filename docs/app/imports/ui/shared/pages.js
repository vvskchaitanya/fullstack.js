(function (global) {
  let currentPath = null;
  let pageCache = {};

  /**
   * Initializes the Pages module.
   * Pages are always rendered to document.body.
   */
  function init() {
    console.log('Pages: Initialized. Pages will be rendered to document.body.');
  }

  /**
   * Fetches a page by path. First checks cache, then localStorage, then fetches from server.
   * @param {string} path - The path to the page (e.g., 'home', 'about', 'contact').
   * @returns {Promise<string|null>} The HTML content of the page, or null if not found.
   */
  async function fetch(path) {
    // Normalize path
    if (!path || path === '') {
      path = 'home';
    }

    // Check in-memory cache
    if (pageCache[path]) {
      console.log(`Pages: Fetched '${path}' from memory cache.`);
      return pageCache[path];
    }

    // Check localStorage
    const cacheKey = `pages/${path}`;
    const cachedPage = localStorage.getItem(cacheKey);
    if (cachedPage) {
      console.log(`Pages: Fetched '${path}' from localStorage.`);
      pageCache[path] = cachedPage;
      return cachedPage;
    }

    // Fetch from server
    try {
      const response = await window.fetch(`../pages/${path}/index.html`);
      if (response.ok) {
        const content = await response.text();
        // Cache in both memory and localStorage
        pageCache[path] = content;
        localStorage.setItem(cacheKey, content);
        console.log(`Pages: Fetched '${path}' from server and cached.`);
        return content;
      } else {
        console.warn(`Pages: Page '${path}' not found on server (${response.status}).`);
        return null;
      }
    } catch (error) {
      console.error(`Pages: Error fetching '${path}':`, error);
      return null;
    }
  }

  /**
   * Refreshes document.body with the given page content.
   * @param {string} content - The HTML content to render.
   */
  function refresh(content) {
    if (!content) {
      console.warn('Pages: No content provided for refresh.');
      document.body.innerHTML = '<div class="page-error">Page content is empty.</div>';
      return;
    }

    try {
      document.body.innerHTML = content;
      console.log('Pages: Refreshed document.body with new content.');
    } catch (error) {
      console.error('Pages: Error refreshing page:', error);
      document.body.innerHTML = '<div class="page-error">Error loading page content.</div>';
    }
  }

  /**
   * Navigates to a page by path. Handles caching, fetching, and rendering.
   * @param {string} path - The path to navigate to.
   */
  async function go(path) {
    // Normalize path
    if (!path || path === '') {
      path = 'home';
    }

    // Check if already on this page
    if (currentPath === path) {
      console.log(`Pages: Already on '${path}'.`);
      return;
    }

    console.log(`Pages: Navigating to '${path}'...`);

    // Fetch the page
    const pageContent = await fetch(path);

    if (pageContent === null) {
      console.error(`Pages: Page '${path}' not found.`);
      refresh('<div class="page-error">Page not found: ' + path + '</div>');
      return;
    }

    // Update current path and refresh
    currentPath = path;
    refresh(pageContent);
  }

  /**
   * Gets the current page path.
   * @returns {string|null} The current page path, or null if none loaded.
   */
  function getCurrentPath() {
    return currentPath;
  }

  /**
   * Clears the page cache (both memory and localStorage).
   * @param {string} path - Optional. If provided, only clears cache for that page.
   */
  function clearCache(path) {
    if (path) {
      delete pageCache[path];
      localStorage.removeItem(`pages/${path}`);
      console.log(`Pages: Cleared cache for '${path}'.`);
    } else {
      pageCache = {};
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('pages/')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log('Pages: Cleared all page cache.');
    }
  }

  // Export public API
  global.Pages = {
    init: init,
    fetch: fetch,
    refresh: refresh,
    go: go,
    getCurrentPath: getCurrentPath,
    clearCache: clearCache
  };

  console.log('Pages module loaded.');
})(window);
