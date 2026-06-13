(function (global) {
  let loggerElement = null;

  /**
   * Initializes the logger by creating a styled textarea and appending it to the document body.
   * Also overrides native console methods (log, error, info, debug) to use Logger.
   */
  function init() {
    if (loggerElement) {
      console.warn('Logger is already initialized.');
      return;
    }

    // Create the textarea element
    loggerElement = document.createElement('textarea');
    loggerElement.id = 'logger';
    loggerElement.style.position = 'fixed';
    loggerElement.style.bottom = '0';
    loggerElement.style.left = '0';
    loggerElement.style.width = '100%';
    loggerElement.style.height = '200px';
    loggerElement.style.backgroundColor = '#1e1e1e';
    loggerElement.style.color = '#d4d4d4';
    loggerElement.style.fontFamily = 'monospace';
    loggerElement.style.fontSize = '14px';
    loggerElement.style.border = 'none';
    loggerElement.style.outline = 'none';
    loggerElement.style.padding = '10px';
    loggerElement.style.resize = 'none';
    loggerElement.style.overflowY = 'auto';
    loggerElement.style.zIndex = '10000';

    loggerElement.readOnly = true;
    
    // Check URL parameter first (logger=true or logger=false)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLoggerParam = urlParams.get("logger");
    
    if (urlLoggerParam !== null) {
      // If URL param exists, set it in sessionStorage (true or false)
      sessionStorage.setItem("logger", urlLoggerParam);
      console.log(`Logger: URL parameter 'logger=${urlLoggerParam}' set in sessionStorage.`);
    }
    
    // Now check sessionStorage to decide whether to enable logger
    const sessionStorageLogger = sessionStorage.getItem("logger");
    const enableLogger = sessionStorageLogger === "true";
    
    if (enableLogger) {
      document.body.appendChild(loggerElement);
    }

    // Override native console methods to use Logger
    const originalConsole = {
      log: window.console.log,
      error: window.console.error,
      info: window.console.info,
      debug: window.console.debug,
      warn: window.console.warn
    };

    window.console.log = function(...args) {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      log('info', message);
      originalConsole.log.apply(console, args); // Also call original for browser console
    };

    window.console.error = function(...args) {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      log('error', message);
      originalConsole.error.apply(console, args);
    };

    window.console.info = function(...args) {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      log('info', message);
      originalConsole.info.apply(console, args);
    };

    window.console.debug = function(...args) {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      log('info', message);
      originalConsole.debug.apply(console, args);
    };

    window.console.warn = function(...args) {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      log('warn', message);
      originalConsole.warn.apply(console, args);
    };

    console.log('Logger initialized and console methods overridden.');
  }

  /**
   * Logs a message to the logger with a specified level.
   * @param {string} level - The log level ('info', 'warn', 'error').
   * @param {any} input - The input to log. If an object, it will be JSON-stringified.
   */
  function log(level, input) {
    if (!loggerElement) {
      console.error('Logger is not initialized. Call init() first.');
      return;
    }

    // Determine the level prefix
    let prefix = '';
    switch (level) {
      case 'info':
        prefix = '[INFO] ';
        break;
      case 'warn':
        prefix = '[WARN] ';
        break;
      case 'error':
        prefix = '[ERROR] ';
        break;
      default:
        console.error('Invalid log level:', level);
        return;
    }

    // Convert input to JSON if it's an object
    let textToLog;
    if (typeof input === 'object') {
      try {
        textToLog = JSON.stringify(input, null, 2);
      } catch (e) {
        textToLog = '[Object could not be stringified]';
      }
    } else {
      textToLog = String(input);
    }

    // Suppress long strings
    if (textToLog.length > 1000) {
      textToLog = textToLog.substring(0, 1000) + '... [truncated]';
    }

    // Append the log to the textarea
    const timestamp = new Date().toISOString();
    loggerElement.value += `${timestamp} ${prefix}${textToLog}\n`;
    loggerElement.scrollTop = loggerElement.scrollHeight; // Scroll to the bottom
  }

  /**
   * Convenience method for logging information messages.
   * @param {any} input - The input to log.
   */
  function info(input) {
    log('info', input);
  }

  /**
   * Convenience method for logging warnings.
   * @param {any} input - The input to log.
   */
  function warn(input) {
    log('warn', input);
  }

  /**
   * Convenience method for logging error messages.
   * @param {any} input - The input to log.
   */
  function error(input) {
    log('error', input);
  }

  /**
   * Clears the logger's textarea.
   */
  function clear() {
    if (!loggerElement) {
      console.error('Logger is not initialized. Call init() first.');
      return;
    }
    loggerElement.value = '';
  }

  // Expose the logger API
  global.Logger = {
    init,
    log,
    info,
    warn,
    error,
    clear,
  };
})(window);
 
