const API_ENDPOINT = window.location.origin.replace("9999", "8888") + "/";

let selectedComponent = null;
let currentPage = null;

document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("save-button");
  const deleteButton = document.getElementById("delete-button");
  const componentSearch = document.getElementById("component-search");
  const addComponentBtn = document.getElementById("add-component-btn");
  const newComponentNameInput = document.getElementById("new-component-name");
  const saveNewComponentBtn = document.getElementById("save-new-component-btn");
  const addComponentModal = new bootstrap.Modal(document.getElementById("addComponentModal"), {});
  const pageSearch = document.getElementById("page-search");
  const deletePageButton = document.getElementById("delete-page-btn");

  // Variables for Pages tab
  const addPageBtn = document.getElementById("add-page-btn");
  const addPageModal = new bootstrap.Modal(document.getElementById("addPageModal"), {});
  const saveNewPageBtn = document.getElementById("save-new-page-btn");

  // Global variables for selection in linking lists (pages tab)
  window.selectedAvailable = null;
  window.selectedLinked = null;

  // Load bundle.json and refresh UI
  function loadBundle() {
    fetch("../bundle.json")
      .then(response => response.json())
      .then(data => {
        window.allComponents = data.components;
        window.allPages = data.pages;
        populateList("components-list", data.components, displayComponentDetails);
        populateList("pages-list", data.pages, displayPageDetails);
      })
      .catch(error => console.error("Error fetching bundle.json:", error));
  }
  loadBundle();

  // --- COMPONENTS TAB ---
  // Search functionality for components
  componentSearch.addEventListener("input", (event) => {
    const searchQuery = event.target.value.toLowerCase();
    const filteredComponents = window.allComponents.filter(component =>
      component.name.toLowerCase().includes(searchQuery)
    );
    populateList("components-list", filteredComponents, displayComponentDetails);
  });

  // Show Save button on edit of any component textarea
  ["template-content", "script-content", "style-content"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => {
      saveButton.classList.remove("d-none");
    });
  });

  // Save component changes
  saveButton.addEventListener("click", () => {
    if (!selectedComponent) return alert("No component selected!");
    const updatedComponent = {
      name: selectedComponent.name,
      template: document.getElementById("template-content").value,
      script: document.getElementById("script-content").value,
      style: document.getElementById("style-content").value
    };
    fetch(API_ENDPOINT + "save-component", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedComponent)
    })
      .then(response => response.json())
      .then(data => {
        alert("Component saved successfully!");
        saveButton.classList.add("d-none");
        loadBundle();
      })
      .catch(error => console.error("Error saving component:", error));
  });

  // Delete component button event
  deleteButton.addEventListener("click", () => {
    if (!selectedComponent) return alert("No component selected!");
    if (confirm("Are you sure you want to delete this component?")) {
      const componentToDelete = { name: selectedComponent.name };
      fetch(API_ENDPOINT + "delete-component", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(componentToDelete)
      })
        .then(response => response.json())
        .then(data => {
          alert("Component deleted successfully!");
          // Clear the editor fields and hide both Save and Delete buttons
          document.getElementById("template-content").value = "";
          document.getElementById("script-content").value = "";
          document.getElementById("style-content").value = "";
          saveButton.classList.add("d-none");
          deleteButton.classList.add("d-none");
          selectedComponent = null;
          loadBundle();
        })
        .catch(error => console.error("Error deleting component:", error));
    }
  });

  // Delete page button event
  deletePageButton.addEventListener("click", () => {
    if (!currentPage) return alert("No page selected!");
    if (confirm("Are you sure you want to delete this page?")) {
      const page = { name: currentPage.name };
      fetch(API_ENDPOINT + "delete-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page)
      })
        .then(response => response.json())
        .then(data => {
          alert("Page deleted successfully!");
          document.getElementById("preview-page-btn").classList.add("d-none");
          document.getElementById("save-page-btn").classList.add("d-none");
          document.getElementById("delete-page-btn").classList.add("d-none");
          currentPage = null;
          loadBundle();
        })
        .catch(error => console.error("Error deleting page:", error));
    }
  });

  // Add Component Modal events
  addComponentBtn.addEventListener("click", () => {
    newComponentNameInput.value = "";
    addComponentModal.show();
  });

  saveNewComponentBtn.addEventListener("click", () => {
    const newName = newComponentNameInput.value.trim();
    if (!newName) {
      alert("Please enter a component name.");
      return;
    }
    const newComponent = {
      name: newName,
      template: "",
      script: "",
      style: ""
    };
    fetch(API_ENDPOINT + "save-component", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComponent)
    })
      .then(response => response.json())
      .then(data => {
        alert("New component added successfully!");
        addComponentModal.hide();
        fetch(API_ENDPOINT + "compile").then(() => {
          loadBundle();
        });
      })
      .catch(error => console.error("Error adding new component:", error));
  });

  // --- PAGES TAB ---
  addPageBtn.addEventListener("click", () => {
    document.getElementById("new-page-name").value = "";
    document.getElementById("new-page-path").value = "";
    addPageModal.show();
  });

  saveNewPageBtn.addEventListener("click", () => {
    const newPageName = document.getElementById("new-page-name").value.trim();
    const newPagePath = document.getElementById("new-page-path").value.trim();
    if (!newPageName || !newPagePath) {
      alert("Please enter both page name and path.");
      return;
    }
    const newPage = {
      name: newPageName,
      path: newPagePath,
      components: []
    };
    fetch(API_ENDPOINT + "save-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPage)
    })
      .then(response => response.json())
      .then(data => {
        alert("New page added successfully!");
        addPageModal.hide();
        loadBundle();
      })
      .catch(error => console.error("Error adding new page:", error));
  });

  
    
  function filterPages() {
    const query = pageSearch.value.toLowerCase();
    const filteredPages = window.allPages.filter(page => page.name.toLowerCase().includes(query));
    populateList("pages-list", filteredPages, displayPageDetails);
  }

  pageSearch.addEventListener("input", filterPages);

  // When a page is selected, display its details (name, path, linked components)
  function displayPageDetails(page) {
    currentPage = page;
    document.getElementById("page-name").value = page.name || "";
    document.getElementById("page-path").value = page.path || "";
    if (!page.components) page.components = [];
    updatePageComponentsUI(page);
    document.getElementById("preview-page-btn").classList.remove("d-none");
    document.getElementById("save-page-btn").classList.remove("d-none");
    document.getElementById("delete-page-btn").classList.remove("d-none");
  }

  // Update the available and linked components lists for the current page
  function updatePageComponentsUI(page) {
    const allNames = window.allComponents.map(c => c.name);
    const linkedNames = page.components;
    const availableNames = allNames.filter(name => !linkedNames.includes(name));
    populateSimpleList("available-components", availableNames);
    populateSimpleList("linked-components", linkedNames);
  }

  // Helper: Populate a simple list (of strings) with click selection
  function populateSimpleList(elementId, items) {
    const listElement = document.getElementById(elementId);
    listElement.innerHTML = "";
    items.forEach(item => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = item;
      li.addEventListener("click", () => {
        Array.from(listElement.children).forEach(child => child.classList.remove("active"));
        li.classList.add("active");
        if (elementId === "available-components") {
          window.selectedAvailable = item;
          window.selectedLinked = null;
        } else if (elementId === "linked-components") {
          window.selectedLinked = item;
          window.selectedAvailable = null;
        }
      });
      listElement.appendChild(li);
    });
  }

  document.getElementById("link-btn").addEventListener("click", () => {
    if (!window.selectedAvailable) {
      alert("Please select an available component to link.");
      return;
    }
    const compName = window.selectedAvailable;
    if (!currentPage.components) currentPage.components = [];
    currentPage.components.push(compName);
    updatePageComponentsUI(currentPage);
    window.selectedAvailable = null;
  });

  document.getElementById("unlink-btn").addEventListener("click", () => {
    if (!window.selectedLinked) {
      alert("Please select a linked component to unlink.");
      return;
    }
    const compName = window.selectedLinked;
    currentPage.components = currentPage.components.filter(name => name !== compName);
    updatePageComponentsUI(currentPage);
    window.selectedLinked = null;
  });

  document.getElementById("preview-page-btn").addEventListener("click", () => {
    if (!currentPage) return;
    window.open(window.location.origin+"/"+currentPage.path,"_default");
  });

  document.getElementById("save-page-btn").addEventListener("click", () => {
    if (!currentPage) return;
    currentPage.name = document.getElementById("page-name").value;
    currentPage.path = document.getElementById("page-path").value;
    fetch(API_ENDPOINT + "save-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentPage)
    })
      .then(response => response.json())
      .then(data => {
        alert("Page saved successfully!");
        loadBundle();
      })
      .catch(error => console.error("Error saving page:", error));
  });
});

// Helper: Populate a list (used for components list and pages list)
function populateList(elementId, items, clickHandler) {
  const listElement = document.getElementById(elementId);
  listElement.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.style = "cursor:pointer";
    li.textContent = item.name || item;
    li.addEventListener("click", () => clickHandler(item));
    listElement.appendChild(li);
  });
}

// Display selected component details in the Components tab editor
function displayComponentDetails(component) {
  selectedComponent = component;
  document.getElementById("template-content").value = component.template || "";
  document.getElementById("script-content").value = component.script || "";
  document.getElementById("style-content").value = component.style || "";
  // When a component is selected, hide the Save button until changes occur and show the Delete button.
  document.getElementById("save-button").classList.add("d-none");
  document.getElementById("delete-button").classList.remove("d-none");
}

function recompile(){
  fetch(API_ENDPOINT+"compile").then(()=>window.location.reload());
}
