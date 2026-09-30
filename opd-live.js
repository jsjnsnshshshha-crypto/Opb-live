/* =========================================================
   OPD LIVE - SHARED APPLICATION CORE
   Patient + Doctor + Receptionist + Admin
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "OPD_LIVE_DATABASE_V1";
  const SESSION_KEY = "OPD_LIVE_SESSION_V1";

  /* ---------------------------------------------------------
     DEFAULT DATABASE
     --------------------------------------------------------- */

  const defaultDatabase = {
    app: {
      name: "OPD LIVE",
      version: "1.0.0"
    },

    hospitals: [
      {
        id: "H001",
        name: "OPD LIVE Hospital",
        city: "Lucknow",
        status: "active"
      }
    ],

    doctors: [
      {
        id: "D001",
        name: "Dr. Amit Sharma",
        specialisation: "General Physician",
        hospitalId: "H001",
        available: true,
        opdOpen: true,
        currentToken: 12,
        waiting: 8,
        completed: 11,
        totalPatients: 20
      },
      {
        id: "D002",
        name: "Dr. Priya Verma",
        specialisation: "Gynecologist",
        hospitalId: "H001",
        available: true,
        opdOpen: true,
        currentToken: 7,
        waiting: 5,
        completed: 6,
        totalPatients: 12
      },
      {
        id: "D003",
        name: "Dr. Raj Verma",
        specialisation: "Cardiologist",
        hospitalId: "H001",
        available: false,
        opdOpen: false,
        currentToken: 0,
        waiting: 0,
        completed: 0,
        totalPatients: 0
      }
    ],

    patients: [],

    appointments: [],

    staff: [
      {
        id: "ST001",
        name: "Reception Desk",
        role: "receptionist",
        hospitalId: "H001",
        active: true
      },
      {
        id: "ST002",
        name: "Dr. Amit Sharma",
        role: "doctor",
        doctorId: "D001",
        hospitalId: "H001",
        active: true
      }
    ],

    admin: {
      name: "OPD LIVE Admin",
      active: true
    }
  };

  /* ---------------------------------------------------------
     DATABASE FUNCTIONS
     --------------------------------------------------------- */

  function clone(object) {
    return JSON.parse(JSON.stringify(object));
  }

  function loadDatabase() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        const fresh = clone(defaultDatabase);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        return fresh;
      }

      return JSON.parse(saved);
    } catch (error) {
      console.error("OPD LIVE database error:", error);

      const fresh = clone(defaultDatabase);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
  }

  let database = loadDatabase();

  function saveDatabase() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(database)
    );

    window.dispatchEvent(
      new CustomEvent("opdLiveDatabaseUpdated", {
        detail: database
      })
    );
  }

  function resetDatabase() {
    database = clone(defaultDatabase);
    saveDatabase();
    console.log("OPD LIVE database reset.");
  }

  /* ---------------------------------------------------------
     SESSION
     --------------------------------------------------------- */

  function getSession() {
    try {
      const session = localStorage.getItem(SESSION_KEY);

      if (!session) {
        return null;
      }

      return JSON.parse(session);
    } catch (error) {
      return null;
    }
  }

  function setSession(session) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(session)
    );

    window.dispatchEvent(
      new CustomEvent("opdLiveSessionUpdated", {
        detail: session
      })
    );
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);

    window.dispatchEvent(
      new CustomEvent("opdLiveSessionUpdated")
    );
  }

  /* ---------------------------------------------------------
     PATIENT
     --------------------------------------------------------- */

  function registerPatient(name, mobile) {
    if (!name || !mobile) {
      return {
        success: false,
        message: "Name and mobile number are required."
      };
    }

    const existing = database.patients.find(
      patient => patient.mobile === mobile
    );

    if (existing) {
      return {
        success: false,
        message: "Patient already registered."
      };
    }

    const patient = {
      id: "P" + Date.now(),
      name: name,
      mobile: mobile,
      createdAt: new Date().toISOString()
    };

    database.patients.push(patient);

    saveDatabase();

    setSession({
      type: "patient",
      userId: patient.id
    });

    return {
      success: true,
      patient: patient
    };
  }

  function loginPatient(mobile) {
    const patient = database.patients.find(
      item => item.mobile === mobile
    );

    if (!patient) {
      return {
        success: false,
        message: "Patient not found. Please register first."
      };
    }

    setSession({
      type: "patient",
      userId: patient.id
    });

    return {
      success: true,
      patient: patient
    };
  }

  function getCurrentPatient() {
    const session = getSession();

    if (!session || session.type !== "patient") {
      return null;
    }

    return database.patients.find(
      patient => patient.id === session.userId
    ) || null;
  }

  /* ---------------------------------------------------------
     DOCTOR
     --------------------------------------------------------- */

  function getDoctor(doctorId) {
    return database.doctors.find(
      doctor => doctor.id === doctorId
    ) || null;
  }

  function getAllDoctors() {
    return database.doctors;
  }

  function setDoctorAvailability(doctorId, available) {
    const doctor = getDoctor(doctorId);

    if (!doctor) {
      return false;
    }

    doctor.available = Boolean(available);

    if (!doctor.available) {
      doctor.opdOpen = false;
    }

    saveDatabase();

    return true;
  }

  function setOPDStatus(doctorId, open) {
    const doctor = getDoctor(doctorId);

    if (!doctor) {
      return false;
    }

    doctor.opdOpen = Boolean(open);

    if (doctor.opdOpen) {
      doctor.available = true;
    }

    saveDatabase();

    return true;
  }

  /* ---------------------------------------------------------
     JOIN OPD
     --------------------------------------------------------- */

  function joinOPD(doctorId) {
    const patient = getCurrentPatient();
    const doctor = getDoctor(doctorId);

    if (!patient) {
      return {
        success: false,
        message: "Please login first."
      };
    }

    if (!doctor) {
      return {
        success: false,
        message: "Doctor not found."
      };
    }

    if (!doctor.available || !doctor.opdOpen) {
      return {
        success: false,
        message: "OPD is currently unavailable."
      };
    }

    const alreadyJoined = database.appointments.find(
      appointment =>
        appointment.patientId === patient.id &&
        appointment.doctorId === doctorId &&
        appointment.status === "waiting"
    );

    if (alreadyJoined) {
      return {
        success: false,
        message: "You already have an active OPD token."
      };
    }

    const token =
      doctor.currentToken +
      doctor.waiting +
      1;

    const appointment = {
      id: "A" + Date.now(),
      patientId: patient.id,
      doctorId: doctor.id,
      hospitalId: doctor.hospitalId,
      token: token,
      status: "waiting",
      createdAt: new Date().toISOString()
    };

    database.appointments.push(appointment);

    doctor.waiting += 1;
    doctor.totalPatients += 1;

    saveDatabase();

    return {
      success: true,
      appointment: appointment
    };
  }

  /* ---------------------------------------------------------
     MY OPD
     --------------------------------------------------------- */

  function getMyOPD() {
    const patient = getCurrentPatient();

    if (!patient) {
      return null;
    }

    const appointment = database.appointments.find(
      item =>
        item.patientId === patient.id &&
        item.status === "waiting"
    );

    if (!appointment) {
      return null;
    }

    const doctor = getDoctor(appointment.doctorId);

    if (!doctor) {
      return null;
    }

    const ahead = Math.max(
      appointment.token - doctor.currentToken - 1,
      0
    );

    return {
      appointment: appointment,
      doctor: doctor,
      ahead: ahead
    };
  }

  /* ---------------------------------------------------------
     DOCTOR QUEUE
     --------------------------------------------------------- */

  function nextToken(doctorId) {
    const doctor = getDoctor(doctorId);

    if (!doctor) {
      return {
        success: false,
        message: "Doctor not found."
      };
    }

    const waitingPatients = database.appointments.filter(
      appointment =>
        appointment.doctorId === doctorId &&
        appointment.status === "waiting"
    );

    if (waitingPatients.length === 0) {
      return {
        success: false,
        message: "No patients waiting."
      };
    }

    const current = waitingPatients
      .sort((a, b) => a.token - b.token)[0];

    current.status = "completed";

    doctor.currentToken = current.token;

    doctor.waiting = Math.max(
      doctor.waiting - 1,
      0
    );

    doctor.completed += 1;

    saveDatabase();

    return {
      success: true,
      appointment: current
    };
  }

  function previousToken(doctorId) {
    const doctor = getDoctor(doctorId);

    if (!doctor) {
      return false;
    }

    if (doctor.currentToken <= 0) {
      return false;
    }

    doctor.currentToken -= 1;

    saveDatabase();

    return true;
  }

  /* ---------------------------------------------------------
     RECEPTIONIST - WALK IN PATIENT
     --------------------------------------------------------- */

  function addWalkInPatient(
    doctorId,
    name,
    mobile
  ) {
    const doctor = getDoctor(doctorId);

    if (!doctor) {
      return {
        success: false,
        message: "Doctor not found."
      };
    }

    if (!name || !mobile) {
      return {
        success: false,
        message: "Patient name and mobile are required."
      };
    }

    let patient = database.patients.find(
      item => item.mobile === mobile
    );

    if (!patient) {
      patient = {
        id: "P" + Date.now(),
        name: name,
        mobile: mobile,
        createdAt: new Date().toISOString()
      };

      database.patients.push(patient);
    }

    const token =
      doctor.currentToken +
      doctor.waiting +
      1;

    const appointment = {
      id: "A" + Date.now(),
      patientId: patient.id,
      doctorId: doctor.id,
      hospitalId: doctor.hospitalId,
      token: token,
      status: "waiting",
      type: "walk-in",
      createdAt: new Date().toISOString()
    };

    database.appointments.push(appointment);

    doctor.waiting += 1;
    doctor.totalPatients += 1;

    saveDatabase();

    return {
      success: true,
      appointment: appointment,
      patient: patient
    };
  }

  /* ---------------------------------------------------------
     ADMIN
     --------------------------------------------------------- */

  function getAdminDashboard() {
    const totalPatients = database.patients.length;

    const activeDoctors =
      database.doctors.filter(
        doctor => doctor.available
      ).length;

    const openOPDs =
      database.doctors.filter(
        doctor => doctor.opdOpen
      ).length;

    const waitingPatients =
      database.appointments.filter(
        appointment =>
          appointment.status === "waiting"
      ).length;

    return {
      hospitals: database.hospitals.length,
      patients: totalPatients,
      doctors: database.doctors.length,
      activeDoctors: activeDoctors,
      openOPDs: openOPDs,
      waitingPatients: waitingPatients
    };
  }

  function getAllPatients() {
    return database.patients;
  }

  function getAllAppointments() {
    return database.appointments;
  }

  /* ---------------------------------------------------------
     SEARCH
     --------------------------------------------------------- */

  function searchDoctors(query) {
    const text = String(query || "")
      .trim()
      .toLowerCase();

    if (!text) {
      return database.doctors;
    }

    return database.doctors.filter(
      doctor =>
        doctor.name.toLowerCase().includes(text) ||
        doctor.specialisation.toLowerCase().includes(text)
    );
  }

  function searchHospitals(query) {
    const text = String(query || "")
      .trim()
      .toLowerCase();

    if (!text) {
      return database.hospitals;
    }

    return database.hospitals.filter(
      hospital =>
        hospital.name.toLowerCase().includes(text) ||
        hospital.city.toLowerCase().includes(text)
    );
  }

  /* ---------------------------------------------------------
     CROSS TAB SYNC
     --------------------------------------------------------- */

  window.addEventListener(
    "storage",
    function (event) {

      if (event.key === STORAGE_KEY) {
        database = loadDatabase();

        window.dispatchEvent(
          new CustomEvent(
            "opdLiveDatabaseUpdated",
            {
              detail: database
            }
          )
        );
      }

    }
  );

  /* ---------------------------------------------------------
     PUBLIC API
     --------------------------------------------------------- */

  window.OPDLive = {

    // Database
    getDatabase: () => database,
    saveDatabase,
    resetDatabase,

    // Session
    getSession,
    setSession,
    logout,

    // Patient
    registerPatient,
    loginPatient,
    getCurrentPatient,

    // Doctors
    getDoctor,
    getAllDoctors,
    setDoctorAvailability,
    setOPDStatus,

    // OPD
    joinOPD,
    getMyOPD,

    // Queue
    nextToken,
    previousToken,

    // Receptionist
    addWalkInPatient,

    // Admin
    getAdminDashboard,
    getAllPatients,
    getAllAppointments,

    // Search
    searchDoctors,
    searchHospitals
  };

  console.log(
    "OPD LIVE shared system loaded successfully."
  );

})();
