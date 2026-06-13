const API_ENDPOINT = window.location.origin.replace("9999", "8888") + "/";

let currentPage = null;

document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("save-button");
  const deleteButton = document.getElementById("delete-button");
  const pageSearch = document.getElementById("page-search");
  const addPageBtn = document.getElementById("add-page-btn");
  const saveNewPageBtn = document.getElementById("save-new-page-btn");
  const addPageModal = new bootstrap.Modal(document.getElementById("addPageModal"), {});

  const htmlEditor = document.getElementById("html-editor");
  const scriptEditor = document.getElementById("script-editor");
  const styleEditor = document.getElementById("style-editor");
  const editorTitle = document.getElementById("editor-title");
  const editorSubtitle = document.getElementById("editor-subtitle");
  const pageEditor = document.getElementById("page-editor");
  const noPageSelected = document.getElementById("no-page-selected");


  // Load pages list from the dev API. Pass true to include file contents in the response.
  loadPages();

  // Load pages from the backend dev API
  function loadPages(includeContents = false) {
    const url = API_ENDPOINT + 'get-page' + (includeContents ? '?contents=true' : '');
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!data || !data.success) {
          console.error('Error loading pages:', data);
          window.allPages = [];
          populatePagesList([]);
          return;
        }
        window.allPages = data.pages || [];
        populatePagesList(window.allPages);
      })
      .catch(err => {
        console.error('Error fetching pages from API:', err);
        // fallback to empty list
        window.allPages = [];
        populatePagesList([]);
      });
  }

  // Populate pages list
  function populatePagesList(pages) {
    const list = document.getElementById("pages-list");
    list.innerHTML = "";
    pages.forEach(page => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = page.name;
      li.addEventListener("click", () => displayPageDetails(page));
      list.appendChild(li);
    });
  }

  // Search pages
  pageSearch.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
    const filtered = window.allPages.filter(page =>
      page.name.toLowerCase().includes(query)
    );
    populatePagesList(filtered);
  });

  // Display page details in editor
  function displayPageDetails(page) {
    currentPage = page;
    editorTitle.textContent = page.name;
    editorSubtitle.textContent = `Path: ${page.path || "/"} `;

    // Use contents returned by the API when available, otherwise fetch
    if (page.template || page.script || page.style) {
      htmlEditor.value = page.template || '';
      scriptEditor.value = page.script || '';
      styleEditor.value = page.style || '';
    } else {
      // Fetch page files
      fetch(`../pages/${page.name}/index.html`)
        .then(r => r.text())
        .then(html => htmlEditor.value = html)
        .catch(() => htmlEditor.value = "");

      fetch(`../pages/${page.name}/script.js`)
        .then(r => r.text())
        .then(script => scriptEditor.value = script)
        .catch(() => scriptEditor.value = "");

      fetch(`../pages/${page.name}/style.css`)
        .then(r => r.text())
        .then(style => styleEditor.value = style)
        .catch(() => styleEditor.value = "");
    }

    // Show editor, hide no-selection message
    pageEditor.classList.remove("d-none");
    noPageSelected.classList.add("d-none");

    // Show save and delete buttons
    saveButton.classList.remove("d-none");
    deleteButton.classList.remove("d-none");
  }

  // Show save button on edit
  [htmlEditor, scriptEditor, styleEditor].forEach(editor => {
    editor.addEventListener("input", () => {
      saveButton.classList.remove("d-none");
    });
  });

  // Save page
  saveButton.addEventListener("click", () => {
    if (!currentPage) return alert("No page selected!");

    const updatedPage = {
      name: currentPage.name,
      path: currentPage.path || `/${currentPage.name}`,
      template: htmlEditor.value,
      script: scriptEditor.value,
      style: styleEditor.value
    };

    fetch(API_ENDPOINT + "save-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPage)
    })
      .then(response => response.json())
      .then(data => {
        alert("Page saved successfully!");
        saveButton.classList.add("d-none");
        loadPages();
      })
      .catch(error => console.error("Error saving page:", error));
  });

  // Delete page
  deleteButton.addEventListener("click", () => {
    if (!currentPage) return alert("No page selected!");

    if (confirm(`Are you sure you want to delete the page "${currentPage.name}"?`)) {
      fetch(API_ENDPOINT + "delete-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentPage.name })
      })
        .then(response => response.json())
        .then(data => {
          alert("Page deleted successfully!");
          htmlEditor.value = "";
          scriptEditor.value = "";
          styleEditor.value = "";
          saveButton.classList.add("d-none");
          deleteButton.classList.add("d-none");
          pageEditor.classList.add("d-none");
          noPageSelected.classList.remove("d-none");
          currentPage = null;
          loadPages();
        })
        .catch(error => console.error("Error deleting page:", error));
    }
  });

  // Add page modal
  addPageBtn.addEventListener("click", () => {
    document.getElementById("new-page-name").value = "";
    addPageModal.show();
  });

  saveNewPageBtn.addEventListener("click", () => {
    const pageName = document.getElementById("new-page-name").value.trim();

    if (!pageName) {
      alert("Please enter a page name.");
      return;
    }

    const newPage = {
      name: pageName,
      path: `/${pageName}`,
      template: "",
      script: "",
      style: ""
    };

    fetch(API_ENDPOINT + "save-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPage)
    })
      .then(response => response.json())
      .then(data => {
        alert("Page created successfully!");
        addPageModal.hide();
        loadPages();
      })
      .catch(error => console.error("Error creating page:", error));
  });

  console.log("Page editor initialized.");
});

function recompile() {
  // Reuse the already-declared API_ENDPOINT to avoid redeclaration errors
  const endpoint = (typeof API_ENDPOINT !== 'undefined') ? API_ENDPOINT : window.location.origin.replace("9999", "8888") + "/";
  fetch(endpoint + "compile")
    .then(() => window.location.reload())
    .catch(error => console.error("Compile error:", error));
}
