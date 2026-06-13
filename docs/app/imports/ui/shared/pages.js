(function (global) {
  let currentPath = null;
  let pageCache = {};
  let config = {
    ttl: 3600000 // Default TTL: 1 hour in milliseconds
  };

  /**
   * Initializes the Pages module.
   * Loads config from app.config.json if available.
   * @param {Object} options - Optional config object with {ttl: milliseconds}.
   */
  async function init(options) {
    // Load from app.config.json if it exists
    try {
      const response = await window.fetch('../app.config.json');
      if (response.ok && response.headers.get('Content-Type') && response.headers.get('Content-Type').includes('application/json')) {
        const appConfig = await response.json();
        if (appConfig.pages && appConfig.pages.ttl) {
          config.ttl = appConfig.pages.ttl;
          console.log(`Pages: Loaded TTL from app.config.json: ${config.ttl}ms`);
        }
      }
    } catch (e) {
      console.log('Pages: No app.config.json found, using default TTL.');
    }

    // Override with passed options if provided
    if (options && options.ttl !== undefined) {
      config.ttl = options.ttl;
      console.log(`Pages: TTL overridden to ${config.ttl}ms`);
    }

    console.log(`Pages: Initialized with TTL ${config.ttl}ms. Pages will be rendered to document.body.`);
  }

  /**
   * Checks if a cached page is still valid (within TTL).
   * @param {Object} pageData - The cached page data object.
   * @returns {boolean} True if cache is still valid.
   */
  function isCacheValid(pageData) {
    if (!pageData || !pageData.time) {
      return false;
    }
    const now = Date.now();
    const cacheAge = now - pageData.time;
    return cacheAge < config.ttl;
  }

  /**
   * Fetches a page by path. Loads index.html, script.js, and style.css.
   * Caches them as a JSON object in localStorage with timestamp.
   * @param {string} path - The path to the page (e.g., 'home', 'about', 'contact').
   * @returns {Promise<Object|null>} Object with {template, script, styles, time}, or null if not found.
   */
  async function fetch(path) {
    // Normalize path
    if (!path || path === '') {
      path = 'home';
    }

    // Check in-memory cache
    if (pageCache[path] && isCacheValid(pageCache[path])) {
      console.log(`Pages: Fetched '${path}' from memory cache.`);
      return pageCache[path];
    }

    // Check localStorage
    const cacheKey = `pages/${path}`;
    const cachedPageStr = localStorage.getItem(cacheKey);
    if (cachedPageStr) {
      try {
        const cachedPage = JSON.parse(cachedPageStr);
        if (isCacheValid(cachedPage)) {
          console.log(`Pages: Fetched '${path}' from localStorage (age: ${Date.now() - cachedPage.time}ms).`);
          pageCache[path] = cachedPage;
          return cachedPage;
        } else {
          console.log(`Pages: Cache for '${path}' expired. Fetching fresh from server.`);
          localStorage.removeItem(cacheKey);
        }
      } catch (e) {
        console.warn(`Pages: Failed to parse cached page for '${path}'.`);
        localStorage.removeItem(cacheKey);
      }
    }

    // Fetch from server
    try {
      const pageBasePath = `../pages/${path}`;
      
      // Fetch template (index.html)
      const templateRes = await window.fetch(`${pageBasePath}/index.html`);
      if (!templateRes.ok || !templateRes.headers.get('Content-Type') || !templateRes.headers.get('Content-Type').includes('text/html')) {
        console.warn(`Pages: Page '${path}' not found on server (${templateRes.status}).`);
        return null;
      }
      const template = await templateRes.text();

      // Fetch script (script.js) - optional
      let script = '';
      try {
        const scriptRes = await window.fetch(`${pageBasePath}/script.js`);
        if (scriptRes.ok && scriptRes.headers.get('Content-Type') && scriptRes.headers.get('Content-Type').includes('javascript')) {
          script = await scriptRes.text();
        }
      } catch (e) {
        console.log(`Pages: No script.js found for '${path}'.`);
      }

      // Fetch styles (style.css) - optional
      let styles = '';
      try {
        const stylesRes = await window.fetch(`${pageBasePath}/styles.css`);
        if (stylesRes.ok && stylesRes.headers.get('Content-Type') && stylesRes.headers.get('Content-Type').includes('css')) {
          styles = await stylesRes.text();
        }
      } catch (e) {
        console.log(`Pages: No styles.css found for '${path}'.`);
      }

      // Create page object with timestamp
      const pageObject = {
        template: template,
        script: script,
        style: styles,
        time: Date.now()
      };

      // Cache in both memory and localStorage
      pageCache[path] = pageObject;
      localStorage.setItem(cacheKey, JSON.stringify(pageObject));
      console.log(`Pages: Fetched '${path}' from server and cached with timestamp ${pageObject.time}.`);
      return pageObject;
    } catch (error) {
      console.error(`Pages: Error fetching '${path}':`, error);
      return null;
    }
  }

  /**
   * Refreshes document.body with the given page content (object with template, script, style).
   * Replaces component tags like <$header></$header> by fetching the component page and embedding it.
   * Uses appendChild for script and style elements instead of innerHTML concatenation.
   * @param {Object} pageObject - Object with {template, script, style, time}.
   * @param {string} path - The page path, used as container div ID.
   */
  async function refresh(pageObject, path) {
    if (!pageObject || !pageObject.template) {
      console.warn('Pages: No page object or template provided for refresh.');
      document.body.innerHTML = '<div class="page-error">Page content is empty.</div>';
      return;
    }

    try {
      // Clear document.body
      document.body.innerHTML = '';

      // Create wrapper div with ID = path
      const wrapper = document.createElement('div');
      wrapper.id = path;
      
  // Set template content using innerHTML
  wrapper.innerHTML = pageObject.template;

  // Process component tags inside wrapper (e.g., <$header></$header>)
  await processComponentTags(wrapper);
      
      // Dynamically load and append script to wrapper
      if (pageObject.script && pageObject.script.trim()) {
        const scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.innerHTML = pageObject.script;
        wrapper.appendChild(scriptElement);
      }

      // Dynamically load and append styles to wrapper
      if (pageObject.style && pageObject.style.trim()) {
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.innerHTML = pageObject.style;
        wrapper.appendChild(styleElement);
      }

      // Append wrapper to body
      document.body.appendChild(wrapper);

      const cacheAge = pageObject.time ? ` (cached ${Date.now() - pageObject.time}ms ago)` : '';
      console.log(`Pages: Refreshed document.body with page '${path}'${cacheAge}.`);
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
    const pageObject = await fetch(path);

    if (pageObject === null) {
      console.error(`Pages: Page '${path}' not found.`);
      document.body.innerHTML = '<div class="page-error">Page not found: ' + path + '</div>';
      return;
    }

    // Update current path and refresh
    currentPath = path;
    await refresh(pageObject, path);
  }

  /**
   * Find component tags of the form <$name></$name> inside a root element,
   * fetch the component (from pages/name), and replace the tag with the component content.
   * This is recursive: components can themselves include other component tags.
   * @param {Element} root
   */
  async function processComponentTags(root) {
    // Find all elements matching the pattern: tag name starts with '$'
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    const nodesToProcess = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.tagName && node.tagName.startsWith('$')) {
        nodesToProcess.push(node);
      }
    }

    for (const node of nodesToProcess) {
      const tag = node.tagName; // e.g., "$HEADER"
      const compName = tag.slice(1).toLowerCase();
      try {
        const compPage = await fetch(compName);
        if (compPage && compPage.template) {
          // Create a container for the component
          const compWrapper = document.createElement('div');
          compWrapper.id = compName;
          compWrapper.innerHTML = compPage.template;

          // Append script then style for component
          if (compPage.script && compPage.script.trim()) {
            const s = document.createElement('script');
            s.type = 'text/javascript';
            s.innerHTML = compPage.script;
            compWrapper.appendChild(s);
          }
          if (compPage.style && compPage.style.trim()) {
            const st = document.createElement('style');
            st.type = 'text/css';
            st.innerHTML = compPage.style;
            compWrapper.appendChild(st);
          }

          // Replace node with compWrapper
          node.parentNode.replaceChild(compWrapper, node);

          // Recursively process newly inserted content
          await processComponentTags(compWrapper);
        } else {
          console.warn(`Pages: Component '${compName}' not found or empty.`);
        }
      } catch (e) {
        console.error(`Pages: Error loading component '${compName}':`, e);
      }
    }
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
