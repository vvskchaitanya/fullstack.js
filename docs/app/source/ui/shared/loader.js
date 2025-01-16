(function (global) {
  let loaderElement = null;

  /**
   * Dynamically injects the loader HTML and CSS into the document.
   */
  function injectLoader() {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
      .loader-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .hidden {
        display: none;
      }
      .loader {
        width: 50px;
        height: 50px;
        border: 5px solid #ccc;
        border-top: 5px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);

    // Inject HTML
    const loaderDiv = document.createElement('div');
    loaderDiv.id = 'dynamicLoader';
    loaderDiv.className = 'loader-container hidden';
    loaderDiv.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(loaderDiv);

    loaderElement = loaderDiv;
  }

  /**
   * Initializes the loader. Optionally allows setting a custom ID.
   * @param {string} [customId='dynamicLoader'] - Custom ID for the loader element.
   */
  function init(customId = 'dynamicLoader') {
    loaderElement = document.getElementById(customId);

    if (!loaderElement) {
      injectLoader();
    }
  }

  /**
   * Shows the loader.
   */
  function show() {
    if (!loaderElement) {
      console.error('Loader is not initialized. Call init() first.');
      return;
    }
    loaderElement.classList.remove('hidden');
  }

  /**
   * Hides the loader.
   */
  function hide() {
    if (!loaderElement) {
      console.error('Loader is not initialized. Call init() first.');
      return;
    }
    loaderElement.classList.add('hidden');
  }

  // Expose the library
  global.Loader = {
    init,
    show,
    hide,
  };
})(window);
