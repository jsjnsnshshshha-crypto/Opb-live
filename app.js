// OPD LIVE - Shared prototype data and logic
const OPD_KEY = "opdLiveData";

const defaultData = {
  hospital: "City Care Hospital",
  doctors: [
    { id: "d1", name: "Dr. Amit Sharma", speciality: "Cardiologist", current: 17, status: "Available", patientsToday: 32 },
    { id: "d2", name: "Dr. Priya Verma", speciality: "General Physician", current: 12, status: "Available", patientsToday: 25 },
    { id: "d3", name: "Dr. Rahul Singh", speciality: "Orthopedic", current: 8, status: "Not Available", patientsToday: 18 }
  ],
  patients: [
    { id: "p1", name: "Demo Patient", phone: "9999999999", doctorId: "d1", token: 18, status: "Waiting" }
  ],
  lastUpdated: new Date().toISOString()
};

function getOPDData() {
  try {
    const saved = localStorage.getItem(OPD_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  localStorage.setItem(OPD_KEY, JSON.stringify(defaultData));
  return structuredClone(defaultData);
}

function saveOPDData(data) {
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem(OPD_KEY, JSON.stringify(data));
}

function nextToken(doctorId) {
  const data = getOPDData();
  const doctor = data.doctors.find(d => d.id === doctorId);
  if (!doctor) return null;
  doctor.current += 1;
  doctor.patientsToday += 1;
  data.patients.forEach(p => {
    if (p.doctorId === doctorId && p.token < doctor.current && p.status === "Waiting") {
      p.status = "Completed";
    }
  });
  saveOPDData(data);
  return doctor;
}

function setDoctorStatus(doctorId, status) {
  const data = getOPDData();
  const doctor = data.doctors.find(d => d.id === doctorId);
  if (!doctor) return;
  doctor.status = status;
  saveOPDData(data);
}

function addPatient(name, phone, doctorId) {
  const data = getOPDData();
  const doctor = data.doctors.find(d => d.id === doctorId);
  if (!doctor) return null;
  const maxToken = data.patients
    .filter(p => p.doctorId === doctorId)
    .reduce((m, p) => Math.max(m, Number(p.token) || 0), doctor.current);
  const patient = {
    id: "p" + Date.now(),
    name, phone, doctorId,
    token: maxToken + 1,
    status: "Waiting"
  };
  data.patients.push(patient);
  saveOPDData(data);
  return patient;
}

function resetDemoData() {
  localStorage.setItem(OPD_KEY, JSON.stringify(structuredClone(defaultData)));
}
