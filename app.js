// Simple data store using localStorage
const STORAGE_KEY = "fullstack_app_state_v1";

const defaultState = {
  currentUserId: null,
  accounts: [],
  employees: [],
  departments: [],
  requests: [],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

// Elements
const landingView = document.getElementById("landing-view");
const dashboardView = document.getElementById("dashboard-view");
const authView = document.getElementById("auth-view");
const profileView = document.getElementById("profile-view");
const accountsView = document.getElementById("accounts-view");
const employeesView = document.getElementById("employees-view");
const departmentsView = document.getElementById("departments-view");
const requestsView = document.getElementById("requests-view");

const navRightGuest = document.getElementById("nav-right-guest");
const navRightAuth = document.getElementById("nav-right-auth");

const navLoginBtn = document.getElementById("nav-login-btn");
const navRegisterBtn = document.getElementById("nav-register-btn");

const userMenuToggle = document.getElementById("user-menu-toggle");
const userMenu = document.getElementById("user-menu");
const logoutBtn = document.getElementById("logout-btn");

const authTitle = document.getElementById("auth-title");
const authForm = document.getElementById("auth-form");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const authHint = document.getElementById("auth-hint");

// Tables
const accountsBody = document.getElementById("accounts-body");
const employeesBody = document.getElementById("employees-body");
const departmentsBody = document.getElementById("departments-body");
const requestsBody = document.getElementById("requests-body");

// Profile
const profileContent = document.getElementById("profile-content");
const profileOthersBody = document.getElementById("profile-others-body");

// Dashboard
const dashboardGreeting = document.getElementById("dashboard-greeting");
const dashboardDescription = document.getElementById("dashboard-description");

// Modal
const modalBackdrop = document.getElementById("modal-backdrop");
const modalEl = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const modalSaveBtn = document.getElementById("modal-save-btn");

// Confirmation Modal
const confirmModalBackdrop = document.getElementById("confirm-modal-backdrop");
const confirmModalEl = document.getElementById("confirm-modal");
const confirmModalTitle = document.getElementById("confirm-modal-title");
const confirmModalMessage = document.getElementById("confirm-modal-message");
const confirmModalCloseBtn = document.getElementById("confirm-modal-close-btn");
const confirmModalCancelBtn = document.getElementById("confirm-modal-cancel-btn");
const confirmModalDeleteBtn = document.getElementById("confirm-modal-delete-btn");

// Buttons to add items
const addAccountBtn = document.getElementById("add-account-btn");
const addEmployeeBtn = document.getElementById("add-employee-btn");
const addDepartmentBtn = document.getElementById("add-department-btn");
const addRequestBtn = document.getElementById("add-request-btn");

let currentAuthMode = "login"; // or "register"
let currentModalConfig = null;
let pendingDeleteAction = null; // Store the delete function to execute after confirmation

function showView(name) {
  const allViews = [
    landingView,
    dashboardView,
    authView,
    profileView,
    accountsView,
    employeesView,
    departmentsView,
    requestsView,
  ];
  allViews.forEach((v) => v.classList.add("hidden"));

  switch (name) {
    case "landing":
      landingView.classList.remove("hidden");
      break;
    case "dashboard":
      dashboardView.classList.remove("hidden");
      renderDashboard();
      break;
    case "auth":
      authView.classList.remove("hidden");
      break;
    case "profile":
      profileView.classList.remove("hidden");
      renderProfile();
      break;
    case "accounts":
      accountsView.classList.remove("hidden");
      renderAccounts();
      break;
    case "employees":
      employeesView.classList.remove("hidden");
      renderEmployees();
      break;
    case "departments":
      departmentsView.classList.remove("hidden");
      renderDepartments();
      break;
    case "requests":
      requestsView.classList.remove("hidden");
      renderRequests();
      break;
    default:
      landingView.classList.remove("hidden");
  }
}

function updateNav() {
  const loggedIn = !!state.currentUserId;
  if (loggedIn) {
    navRightGuest.style.display = "none";
    navRightAuth.style.display = "flex";
  } else {
    navRightGuest.style.display = "flex";
    navRightAuth.style.display = "none";
  }
}

// Auth helpers
function setAuthMode(mode) {
  currentAuthMode = mode;
  if (mode === "login") {
    authTitle.textContent = "Login";
    authSubmitBtn.textContent = "Login";
    authHint.textContent =
      "Use an existing account email and password. If you have no account, choose Register.";
  } else {
    authTitle.textContent = "Register";
    authSubmitBtn.textContent = "Register";
    authHint.textContent =
      "Register a new account with email and password. You can edit details later in Accounts.";
  }
  authEmail.value = "";
  authPassword.value = "";
}

function findAccountByEmail(email) {
  return state.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();
  if (!email || !password) return;

  if (currentAuthMode === "login") {
    const account = findAccountByEmail(email);
    if (!account || account.password !== password) {
      authHint.textContent = "Invalid email or password.";
      authHint.style.color = "#b91c1c";
      return;
    }
    state.currentUserId = account.id;
    saveState();
    updateNav();
    userMenu.classList.remove("show");
    showView("dashboard");
  } else {
    if (findAccountByEmail(email)) {
      authHint.textContent = "Email already registered. Try logging in.";
      authHint.style.color = "#b91c1c";
      return;
    }
    const id = "acc_" + Date.now();
    const newAccount = {
      id,
      title: "",
      firstName: email.split("@")[0],
      lastName: "",
      email,
      role: "User",
      status: "Active",
      password,
    };
    state.accounts.push(newAccount);
    state.currentUserId = id;
    saveState();
    updateNav();
    userMenu.classList.remove("show");
    showView("dashboard");
  }
}

// Rendering functions
function renderDashboard() {
  const user = state.accounts.find((a) => a.id === state.currentUserId);
  if (!user) {
    dashboardGreeting.textContent = "Hello!";
    dashboardDescription.textContent = "Welcome to FULLSTACK APP.";
    return;
  }
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email.split("@")[0];
  dashboardGreeting.textContent = `Hello, ${fullName}!`;
  dashboardDescription.textContent = `Welcome back to FULLSTACK APP. You are logged in as ${user.email} with the role of ${user.role}.`;
}

function renderProfile() {
  const user = state.accounts.find((a) => a.id === state.currentUserId);
  if (!user) {
    profileContent.textContent = "No user info found.";
    return;
  }
  profileContent.innerHTML = `
    <p><strong>Title:</strong> ${user.title || "-"}</p>
    <p><strong>Name:</strong> ${user.firstName || ""} ${user.lastName || ""}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Role:</strong> ${user.role}</p>
    <p><strong>Status:</strong> ${user.status}</p>
  `;

  profileOthersBody.innerHTML = "";
  state.accounts
    .filter((a) => a.id !== state.currentUserId)
    .forEach((a) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${a.title || "-"}</td>
        <td>${a.firstName || ""}</td>
        <td>${a.lastName || ""}</td>
        <td>${a.email}</td>
        <td>${a.role}</td>
        <td>${renderStatusBadge(a.status)}</td>
      `;
      profileOthersBody.appendChild(tr);
    });
}

function renderStatusBadge(status) {
  const lower = String(status || "").toLowerCase();
  let cls = "badge-pending";
  if (lower === "active") cls = "badge-active";
  else if (lower === "inactive") cls = "badge-inactive";
  return `<span class="badge ${cls}">${status || "Pending"}</span>`;
}

function renderAccounts() {
  accountsBody.innerHTML = "";
  state.accounts.forEach((acc) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${acc.title || "-"}</td>
      <td>${acc.firstName || ""}</td>
      <td>${acc.lastName || ""}</td>
      <td>${acc.email}</td>
      <td>${acc.role}</td>
      <td>${renderStatusBadge(acc.status)}</td>
      <td>
        <div class="table-actions">
          <button class="secondary-btn" data-action="edit-account" data-id="${acc.id}">Edit</button>
          <button class="secondary-btn" data-action="delete-account" data-id="${acc.id}">Delete</button>
        </div>
      </td>
    `;
    accountsBody.appendChild(tr);
  });
}

function renderEmployees() {
  employeesBody.innerHTML = "";
  state.employees.forEach((emp) => {
    const account = state.accounts.find((a) => a.id === emp.accountId);
    const department = state.departments.find((d) => d.id === emp.departmentId);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${emp.employeeId}</td>
      <td>${account ? account.email : "-"}</td>
      <td>${emp.position || "-"}</td>
      <td>${department ? department.name : "-"}</td>
      <td>${emp.hireDate || "-"}</td>
      <td>${renderStatusBadge(emp.status)}</td>
      <td>
        <div class="table-actions">
          <button class="secondary-btn" data-action="edit-employee" data-id="${emp.id}">Edit</button>
          <button class="secondary-btn" data-action="delete-employee" data-id="${emp.id}">Delete</button>
        </div>
      </td>
    `;
    employeesBody.appendChild(tr);
  });
}

function renderDepartments() {
  departmentsBody.innerHTML = "";
  state.departments.forEach((dept) => {
    const count = state.employees.filter((e) => e.departmentId === dept.id).length;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${dept.name}</td>
      <td>${dept.description || "-"}</td>
      <td>${count}</td>
      <td>
        <div class="table-actions">
          <button class="secondary-btn" data-action="edit-department" data-id="${dept.id}">Edit</button>
          <button class="secondary-btn" data-action="delete-department" data-id="${dept.id}">Delete</button>
        </div>
      </td>
    `;
    departmentsBody.appendChild(tr);
  });
}

function renderRequests() {
  requestsBody.innerHTML = "";
  state.requests.forEach((req) => {
    const employee = state.employees.find((e) => e.id === req.employeeId);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${req.type || "-"}</td>
      <td>${employee ? employee.employeeId : "-"}</td>
      <td>${req.items || "-"}</td>
      <td>${renderStatusBadge(req.status)}</td>
      <td>
        <div class="table-actions">
          <button class="secondary-btn" data-action="edit-request" data-id="${req.id}">Edit</button>
          <button class="secondary-btn" data-action="delete-request" data-id="${req.id}">Delete</button>
        </div>
      </td>
    `;
    requestsBody.appendChild(tr);
  });
}

// Modal helpers
function openModal(config) {
  currentModalConfig = config;
  modalTitle.textContent = config.title || "";
  modalBody.innerHTML = "";

  config.fields.forEach((field) => {
    const wrap = document.createElement("div");
    wrap.className = "form-row";
    const label = document.createElement("label");
    label.textContent = field.label;
    label.setAttribute("for", field.name);
    wrap.appendChild(label);

    let input;
    if (field.type === "select") {
      input = document.createElement("select");
      (field.options || []).forEach((opt) => {
        const o = document.createElement("option");
        o.value = opt.value;
        o.textContent = opt.label;
        input.appendChild(o);
      });
    } else if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 3;
    } else {
      input = document.createElement("input");
      input.type = field.type || "text";
    }
    input.id = field.name;
    input.name = field.name;
    if (field.value != null) input.value = field.value;
    if (field.required) input.required = true;
    wrap.appendChild(input);
    modalBody.appendChild(wrap);
  });

  modalBackdrop.classList.remove("hidden");
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
  currentModalConfig = null;
}

function collectModalData() {
  if (!currentModalConfig) return null;
  const data = {};
  for (const field of currentModalConfig.fields) {
    const el = document.getElementById(field.name);
    if (!el) continue;
    data[field.name] = el.value.trim();
  }
  return data;
}

// Add / Edit handlers
function handleAddAccount() {
  openModal({
    title: "Add Account",
    type: "account",
    mode: "create",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "firstName", label: "First Name", type: "text", required: true },
      { name: "lastName", label: "Last Name", type: "text" },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "role", label: "Role", type: "text", value: "User" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Inactive" },
        ],
        value: "Active",
      },
      { name: "password", label: "Password", type: "password", required: true },
    ],
  });
}

function handleEditAccount(id) {
  const acc = state.accounts.find((a) => a.id === id);
  if (!acc) return;
  openModal({
    title: "Edit Account",
    type: "account",
    mode: "edit",
    id,
    fields: [
      { name: "title", label: "Title", type: "text", value: acc.title },
      { name: "firstName", label: "First Name", type: "text", required: true, value: acc.firstName },
      { name: "lastName", label: "Last Name", type: "text", value: acc.lastName },
      { name: "email", label: "Email", type: "email", required: true, value: acc.email },
      { name: "role", label: "Role", type: "text", value: acc.role },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Inactive" },
        ],
        value: acc.status,
      },
      { name: "password", label: "Password", type: "password", value: acc.password || "" },
    ],
  });
}

function handleAddEmployee() {
  openModal({
    title: "Add Employee",
    type: "employee",
    mode: "create",
    fields: [
      { name: "employeeId", label: "Employee ID", type: "text", required: true },
      {
        name: "accountId",
        label: "Account (by email)",
        type: "select",
        options: state.accounts.map((a) => ({ value: a.id, label: a.email })),
      },
      { name: "position", label: "Position", type: "text" },
      {
        name: "departmentId",
        label: "Department",
        type: "select",
        options: state.departments.map((d) => ({ value: d.id, label: d.name })),
      },
      { name: "hireDate", label: "Hire Date", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Inactive" },
        ],
        value: "Active",
      },
    ],
  });
}

function handleEditEmployee(id) {
  const emp = state.employees.find((e) => e.id === id);
  if (!emp) return;
  openModal({
    title: "Edit Employee",
    type: "employee",
    mode: "edit",
    id,
    fields: [
      { name: "employeeId", label: "Employee ID", type: "text", required: true, value: emp.employeeId },
      {
        name: "accountId",
        label: "Account (by email)",
        type: "select",
        options: state.accounts.map((a) => ({ value: a.id, label: a.email })),
        value: emp.accountId || "",
      },
      { name: "position", label: "Position", type: "text", value: emp.position },
      {
        name: "departmentId",
        label: "Department",
        type: "select",
        options: state.departments.map((d) => ({ value: d.id, label: d.name })),
        value: emp.departmentId || "",
      },
      { name: "hireDate", label: "Hire Date", type: "date", value: emp.hireDate },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Inactive" },
        ],
        value: emp.status,
      },
    ],
  });
}

function handleAddDepartment() {
  openModal({
    title: "Add Department",
    type: "department",
    mode: "create",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
    ],
  });
}

function handleEditDepartment(id) {
  const dept = state.departments.find((d) => d.id === id);
  if (!dept) return;
  openModal({
    title: "Edit Department",
    type: "department",
    mode: "edit",
    id,
    fields: [
      { name: "name", label: "Name", type: "text", required: true, value: dept.name },
      { name: "description", label: "Description", type: "textarea", value: dept.description },
    ],
  });
}

function handleAddRequest() {
  openModal({
    title: "Add Request",
    type: "request",
    mode: "create",
    fields: [
      { name: "type", label: "Type", type: "text", required: true },
      {
        name: "employeeId",
        label: "Employee",
        type: "select",
        options: state.employees.map((e) => ({ value: e.id, label: e.employeeId })),
      },
      { name: "items", label: "Items", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "Pending", label: "Pending" },
          { value: "Approved", label: "Approved" },
          { value: "Rejected", label: "Rejected" },
        ],
        value: "Pending",
      },
    ],
  });
}

function handleEditRequest(id) {
  const req = state.requests.find((r) => r.id === id);
  if (!req) return;
  openModal({
    title: "Edit Request",
    type: "request",
    mode: "edit",
    id,
    fields: [
      { name: "type", label: "Type", type: "text", required: true, value: req.type },
      {
        name: "employeeId",
        label: "Employee",
        type: "select",
        options: state.employees.map((e) => ({ value: e.id, label: e.employeeId })),
        value: req.employeeId || "",
      },
      { name: "items", label: "Items", type: "textarea", value: req.items },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "Pending", label: "Pending" },
          { value: "Approved", label: "Approved" },
          { value: "Rejected", label: "Rejected" },
        ],
        value: req.status,
      },
    ],
  });
}

function handleModalSave() {
  if (!currentModalConfig) return;
  const data = collectModalData();
  if (!data) return;

  const { type, mode, id } = currentModalConfig;

  if (type === "account") {
    if (mode === "create") {
      if (findAccountByEmail(data.email)) {
        alert("Email already exists.");
        return;
      }
      const newAcc = {
        id: "acc_" + Date.now(),
        title: data.title,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role || "User",
        status: data.status || "Active",
        password: data.password,
      };
      state.accounts.push(newAcc);
    } else {
      const acc = state.accounts.find((a) => a.id === id);
      if (!acc) return;
      acc.title = data.title;
      acc.firstName = data.firstName;
      acc.lastName = data.lastName;
      acc.email = data.email;
      acc.role = data.role || "User";
      acc.status = data.status || "Active";
      if (data.password) acc.password = data.password;
    }
    saveState();
    renderAccounts();
    renderProfile();
  } else if (type === "employee") {
    if (mode === "create") {
      const newEmp = {
        id: "emp_" + Date.now(),
        employeeId: data.employeeId,
        accountId: data.accountId || null,
        position: data.position,
        departmentId: data.departmentId || null,
        hireDate: data.hireDate,
        status: data.status || "Active",
      };
      state.employees.push(newEmp);
    } else {
      const emp = state.employees.find((e) => e.id === id);
      if (!emp) return;
      emp.employeeId = data.employeeId;
      emp.accountId = data.accountId || null;
      emp.position = data.position;
      emp.departmentId = data.departmentId || null;
      emp.hireDate = data.hireDate;
      emp.status = data.status || "Active";
    }
    saveState();
    renderEmployees();
    renderDepartments();
    renderRequests();
  } else if (type === "department") {
    if (mode === "create") {
      const newDept = {
        id: "dept_" + Date.now(),
        name: data.name,
        description: data.description,
      };
      state.departments.push(newDept);
    } else {
      const dept = state.departments.find((d) => d.id === id);
      if (!dept) return;
      dept.name = data.name;
      dept.description = data.description;
    }
    saveState();
    renderDepartments();
    renderEmployees();
  } else if (type === "request") {
    if (mode === "create") {
      const newReq = {
        id: "req_" + Date.now(),
        type: data.type,
        employeeId: data.employeeId || null,
        items: data.items,
        status: data.status || "Pending",
      };
      state.requests.push(newReq);
    } else {
      const req = state.requests.find((r) => r.id === id);
      if (!req) return;
      req.type = data.type;
      req.employeeId = data.employeeId || null;
      req.items = data.items;
      req.status = data.status || "Pending";
    }
    saveState();
    renderRequests();
  }

  closeModal();
}


function countAdminAccounts() {
  return state.accounts.filter((a) => a.role && a.role.toLowerCase() === "admin").length;
}


function getCurrentUser() {
  return state.accounts.find((a) => a.id === state.currentUserId);
}


function openConfirmModal(title, message, onConfirm) {
  confirmModalTitle.textContent = title || "Confirm Deletion";
  confirmModalMessage.textContent = message;
  pendingDeleteAction = onConfirm;
  confirmModalBackdrop.classList.remove("hidden");
}

function closeConfirmModal() {
  confirmModalBackdrop.classList.add("hidden");
  pendingDeleteAction = null;
}

function executePendingDelete() {
  if (pendingDeleteAction) {
    pendingDeleteAction();
    closeConfirmModal();
  }
}

// Delete handlers
function deleteAccount(id) {
  const accountToDelete = state.accounts.find((a) => a.id === id);
  if (!accountToDelete) return;

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  
  if (state.currentUserId === id) {
    alert("You cannot delete your own account. Please ask another admin to delete it.");
    return;
  }

  
  const adminCount = countAdminAccounts();
  const isAccountAdmin = accountToDelete.role && accountToDelete.role.toLowerCase() === "admin";
  
  if (isAccountAdmin && adminCount <= 1) {
    alert("Cannot delete the last admin account. The system requires at least one admin.");
    return;
  }

  
  const message = `Are you sure you want to delete ${accountToDelete.email}? This action cannot be undone.`;
  openConfirmModal("Delete Account", message, () => {
   
    state.accounts = state.accounts.filter((a) => a.id !== id);
    
    
    if (state.currentUserId === id) {
      state.currentUserId = null;
    }
    
    saveState();
    updateNav();
    renderAccounts();
    renderProfile();
  });
}

function deleteEmployee(id) {
  if (!confirm("Delete this employee?")) return;
  state.employees = state.employees.filter((e) => e.id !== id);
  saveState();
  renderEmployees();
  renderDepartments();
  renderRequests();
}

function deleteDepartment(id) {
  if (!confirm("Delete this department?")) return;
  state.departments = state.departments.filter((d) => d.id !== id);
  state.employees = state.employees.map((e) =>
    e.departmentId === id ? { ...e, departmentId: null } : e
  );
  saveState();
  renderDepartments();
  renderEmployees();
}

function deleteRequest(id) {
  if (!confirm("Delete this request?")) return;
  state.requests = state.requests.filter((r) => r.id !== id);
  saveState();
  renderRequests();
}

// Event listeners
navLoginBtn.addEventListener("click", () => {
  setAuthMode("login");
  showView("auth");
});

navRegisterBtn.addEventListener("click", () => {
  setAuthMode("register");
  showView("auth");
});

authForm.addEventListener("submit", handleAuthSubmit);

userMenuToggle.addEventListener("click", () => {
  userMenu.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!userMenu.contains(e.target) && e.target !== userMenuToggle) {
    userMenu.classList.remove("show");
  }
});

userMenu.addEventListener("click", (e) => {
  const btn = e.target.closest(".dropdown-item");
  if (!btn) return;
  const view = btn.dataset.view;
  if (view) {
    showView(view);
  }
});

logoutBtn.addEventListener("click", () => {
  state.currentUserId = null;
  saveState();
  updateNav();
  showView("landing");
});

modalCloseBtn.addEventListener("click", closeModal);
modalCancelBtn.addEventListener("click", closeModal);
modalSaveBtn.addEventListener("click", handleModalSave);

modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) {
    closeModal();
  }
});

// Confirmation modal event listeners
confirmModalCloseBtn.addEventListener("click", closeConfirmModal);
confirmModalCancelBtn.addEventListener("click", closeConfirmModal);
confirmModalDeleteBtn.addEventListener("click", executePendingDelete);

confirmModalBackdrop.addEventListener("click", (e) => {
  if (e.target === confirmModalBackdrop) {
    closeConfirmModal();
  }
});

addAccountBtn.addEventListener("click", handleAddAccount);
addEmployeeBtn.addEventListener("click", handleAddEmployee);
addDepartmentBtn.addEventListener("click", handleAddDepartment);
addRequestBtn.addEventListener("click", handleAddRequest);

accountsBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if (action === "edit-account") handleEditAccount(id);
  else if (action === "delete-account") deleteAccount(id);
});

employeesBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if (action === "edit-employee") handleEditEmployee(id);
  else if (action === "delete-employee") deleteEmployee(id);
});

departmentsBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if (action === "edit-department") handleEditDepartment(id);
  else if (action === "delete-department") deleteDepartment(id);
});

requestsBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if (action === "edit-request") handleEditRequest(id);
  else if (action === "delete-request") deleteRequest(id);
});

// Initial render
updateNav();
if (state.currentUserId) {
  showView("dashboard");
  renderAccounts();
  renderEmployees();
  renderDepartments();
  renderRequests();
} else {
  showView("landing");
}

