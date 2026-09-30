/* =========================================================
   OPD LIVE - COMMON APPLICATION LOGIC
   Patient + Doctor/Receptionist + Admin
   Prototype / Demo Data
========================================================= */

const OPD_STORAGE = "opdLiveData";
const USER_STORAGE = "opdLiveUser";

/* -------------------------
   DEFAULT DATA
------------------------- */

const defaultData = {
  doctors: [
    {
      id: "D001",
      name: "Dr. Amit Sharma",
      specialization: "Cardiologist",
      hospital: "City Care Hospital",
      currentOPD: 17,
      status: "Available",
      queue: 8
    },
    {
      id: "D002",
      name: "Dr. Priya Verma",
      specialization: "General Physician",
      hospital: "Sunrise Hospital",
      currentOPD: 12,
      status: "Available",
      queue: 5
    },
    {
      id: "D003",
      name: "Dr. Rahul Mehta",
      specialization: "Orthopedic",
      hospital: "OPD Care Hospital",
      currentOPD: 9,
      status: "Available",
      queue: 3
    }
  ],

  patients: [],

  settings: {
    opdLive: true
  }
};


/* -------------------------
   DATA FUNCTIONS
------------------------- */

function getOPDData() {
  const saved = localStorage.getItem(OPD_STORAGE);

  if (!saved) {
    localStorage.setItem(
      OPD_STORAGE,
      JSON.stringify(defaultData)
    );

    return defaultData;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    localStorage.setItem(
      OPD_STORAGE,
      JSON.stringify(defaultData)
    );

    return defaultData;
  }
}


function saveOPDData(data) {
  localStorage.setItem(
    OPD_STORAGE,
    JSON.stringify(data)
  );
}


/* -------------------------
   USER LOGIN
------------------------- */

function getCurrentUser() {
  const savedUser = localStorage.getItem(USER_STORAGE);

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch (error) {
    localStorage.removeItem(USER_STORAGE);
    return null;
  }
}


function saveCurrentUser(user) {
  localStorage.setItem(
    USER_STORAGE,
    JSON.stringify(user)
  );
}


function logoutUser() {
  localStorage.removeItem(USER_STORAGE);

  showMessage("You have been logged out.");

  setTimeout(function () {
    location.reload();
  }, 700);
}


/* -------------------------
   PATIENT LOGIN / REGISTER
------------------------- */

function registerPatient(name, phone) {

  if (!name || !phone) {
    showMessage("Please enter name and mobile number.");
    return false;
  }

  const data = getOPDData();

  const existingPatient = data.patients.find(
    patient => patient.phone === phone
  );

  if (existingPatient) {
    saveCurrentUser(existingPatient);
    showMessage("Welcome back!");

    if (typeof updatePatientUI === "function") {
      updatePatientUI();
    }

    return true;
  }

  const patient = {
    id: "P" + Date.now(),
    name: name,
    phone: phone,
    opd: null,
    doctorId: null,
    createdAt: new Date().toISOString()
  };

  data.patients.push(patient);

  saveOPDData(data);
  saveCurrentUser(patient);

  showMessage("Registration successful!");

  if (typeof updatePatientUI === "function") {
    updatePatientUI();
  }

  return true;
}


function loginPatient(phone) {

  if (!phone) {
    showMessage("Please enter your mobile number.");
    return false;
  }

  const data = getOPDData();

  const patient = data.patients.find(
    item => item.phone === phone
  );

  if (!patient) {
    showMessage("Patient not found. Please register first.");
    return false;
  }

  saveCurrentUser(patient);

  showMessage("Login successful!");

  if (typeof updatePatientUI === "function") {
    updatePatientUI();
  }

  return true;
}


/* -------------------------
   JOIN OPD
------------------------- */

function joinOPD(doctorName) {

  const user = getCurrentUser();

  if (!user) {
    openLogin();
    return;
  }

  const data = getOPDData();

  const doctor = data.doctors.find(
    item => item.name === doctorName
  );

  if (!doctor) {
    showMessage("Doctor not found.");
    return;
  }

  if (doctor.status !== "Available") {
    showMessage("This doctor is currently unavailable.");
    return;
  }

  const patient = data.patients.find(
    item => item.id === user.id
  );

  if (!patient) {
    showMessage("Patient account not found.");
    return;
  }

  if (patient.opd && patient.doctorId) {
    showMessage(
      "You already have OPD number " + patient.opd
    );
    return;
  }

  doctor.queue += 1;

  const token = doctor.queue;

  patient.opd = token;
  patient.doctorId = doctor.id;

  saveOPDData(data);
  saveCurrentUser(patient);

  showMessage(
    "OPD joined successfully. Your number is " + token
  );

  if (typeof updatePatientUI === "function") {
    updatePatientUI();
  }
}


/* -------------------------
   MY OPD
------------------------- */

function openMyOPD() {

  const user = getCurrentUser();

  if (!user) {
    openLogin();
    return;
  }

  if (!user.opd) {
    showMessage("You have not joined an OPD yet.");
    return;
  }

  showMessage(
    "Your OPD number is " + user.opd
  );
}


/* -------------------------
   DOCTOR DETAILS
------------------------- */

function openDoctor(doctorName) {

  const data = getOPDData();

  const doctor = data.doctors.find(
    item => item.name === doctorName
  );

  if (!doctor) {
    showMessage("Doctor information not found.");
    return;
  }

  showMessage(
    doctor.name +
    " • " +
    doctor.specialization +
    " • Current OPD: " +
    doctor.currentOPD
  );
}


/* -------------------------
   SEARCH
------------------------- */

function searchDoctors() {

  const input = document.getElementById("searchInput");

  if (!input) {
    return;
  }

  const searchText =
    input.value.toLowerCase().trim();

  const cards =
    document.querySelectorAll(".doctor-card");

  cards.forEach(function (card) {

    const text =
      (card.dataset.search || card.innerText)
      .toLowerCase();

    card.style.display =
      !searchText || text.includes(searchText)
        ? ""
        : "none";
  });
}


/* -------------------------
   EMERGENCY
------------------------- */

function showEmergency() {

  showMessage(
    "Emergency: Please contact the nearest emergency department."
  );
}


/* -------------------------
   NOTIFICATIONS
------------------------- */

function showNotifications() {

  showMessage(
    "No new notifications."
  );
}


/* -------------------------
   LOGIN MODAL
------------------------- */

function openLogin() {

  const modal =
    document.getElementById("loginModal");

  if (modal) {
    modal.classList.add("show");
    return;
  }

  showMessage(
    "Login screen is available in the Patient App."
  );
}


function closeLogin() {

  const modal =
    document.getElementById("loginModal");

  if (modal) {
    modal.classList.remove("show");
  }
}


/* -------------------------
   MESSAGE / TOAST
------------------------- */

function showMessage(message) {

  let toast =
    document.getElementById("toast");

  if (!toast) {

    toast = document.createElement("div");

    toast.id = "toast";
    toast.className = "toast";

    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.opdToastTimer);

  window.opdToastTimer =
    setTimeout(function () {
      toast.classList.remove("show");
    }, 2500);
}


/* -------------------------
   PATIENT UI
------------------------- */

function updatePatientUI() {

  const user = getCurrentUser();

  const mySection =
    document.getElementById("myOpdSection");

  if (!mySection) {
    return;
  }

  if (!user) {

    mySection.innerHTML = `
      <div class="login-icon">🎫</div>

      <h3>My OPD Number</h3>

      <p>
        Login or register to join an OPD,
        track your queue and receive live notifications.
      </p>

      <button
        class="primary-btn"
        style="padding:0 20px;"
        onclick="openLogin()">
        Login / Register
      </button>
    `;

    return;
  }


  if (!user.opd) {

    mySection.innerHTML = `
      <div class="login-icon">🎫</div>

      <h3>My OPD Number</h3>

      <p>
        Welcome, ${user.name}.
        Join a doctor OPD to receive your token number.
      </p>

      <button
        class="primary-btn"
        style="padding:0 20px;"
        onclick="showMessage('Select a doctor and tap Join OPD')">
        Find Doctor
      </button>
    `;

    return;
  }


  const data = getOPDData();

  const doctor =
    data.doctors.find(
      item => item.id === user.doctorId
    );


  mySection.className =
    "my-opd-card";


  mySection.innerHTML = `
    <div class="my-opd-header">

      <div class="my-opd-title">
        MY OPD
      </div>

      <div>
        LIVE
      </div>

    </div>

    <div class="my-opd-main">

      <div>
        <div class="my-number">
          ${user.opd}
        </div>

        <div class="my-number-label">
          Your OPD Number
        </div>
      </div>

      <div class="ahead">

        <strong>
          ${doctor ? doctor.currentOPD : "-"}
        </strong>

        <small>
          Current OPD
        </small>

      </div>

    </div>

    <div style="margin-top:12px;font-size:11px;opacity:.9;">
      ${doctor ? doctor.name : "Doctor"}
    </div>
  `;
}


/* -------------------------
   STAFF FUNCTIONS
------------------------- */

function staffLogin(name, role) {

  const staffUser = {
    id: "S" + Date.now(),
    name: name || "Staff User",
    role: role || "Receptionist"
  };

  localStorage.setItem(
    "opdLiveStaff",
    JSON.stringify(staffUser)
  );

  showMessage(
    "Staff login successful."
  );

  return true;
}


function getStaffUser() {

  const saved =
    localStorage.getItem("opdLiveStaff");

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    return null;
  }
}


/* -------------------------
   DOCTOR / RECEPTIONIST QUEUE
------------------------- */

function updateDoctorQueue(doctorId, newNumber) {

  const data = getOPDData();

  const doctor =
    data.doctors.find(
      item => item.id === doctorId
    );

  if (!doctor) {
    showMessage("Doctor not found.");
    return;
  }

  doctor.currentOPD =
    Number(newNumber);

  saveOPDData(data);

  showMessage(
    "OPD number updated to " +
    doctor.currentOPD
  );

  return doctor;
}


function changeDoctorStatus(
  doctorId,
  status
) {

  const data = getOPDData();

  const doctor =
    data.doctors.find(
      item => item.id === doctorId
    );

  if (!doctor) {
    showMessage("Doctor not found.");
    return;
  }

  doctor.status = status;

  saveOPDData(data);

  showMessage(
    doctor.name +
    " is now " +
    status
  );

  return doctor;
}


/* -------------------------
   ADMIN FUNCTIONS
------------------------- */

function getAdminData() {

  const data = getOPDData();

  return {
    totalDoctors: data.doctors.length,
    totalPatients: data.patients.length,
    activeDoctors:
      data.doctors.filter(
        doctor => doctor.status === "Available"
      ).length
  };
}


function addDoctor(
  name,
  specialization,
  hospital
) {

  if (!name || !specialization || !hospital) {
    showMessage(
      "Please fill all doctor details."
    );
    return false;
  }

  const data = getOPDData();

  const doctor = {
    id: "D" + Date.now(),
    name: name,
    specialization: specialization,
    hospital: hospital,
    currentOPD: 0,
    status: "Available",
    queue: 0
  };

  data.doctors.push(doctor);

  saveOPDData(data);

  showMessage(
    "Doctor added successfully."
  );

  return true;
}


/* -------------------------
   START APP
------------------------- */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    getOPDData();

    if (
      typeof updatePatientUI ===
      "function"
    ) {
      updatePatientUI();
    }

    console.log(
      "OPD LIVE application started."
    );
  }
);
