const appointmentRepo = require("../repository/appointment");
const patientService = require("./patient");
const { APPOINTMENT_DATA } = require("../data/mock_data");

const getAll = async () => {
  const items = await appointmentRepo.findAll();
  // const items = APPOINTMENT_DATA;
  return {
    items,
    count: items.length,
  };
};

const getById = async (id) => {
  const appointment = await appointmentRepo.findById(id);

  if (!appointment) {
    throw Error(`No appointment with id ${id} exists`, { id });
  }

  return appointment;
};

const create = async ({
  date,
  description,
  numberOfBeds,
  condition,
  patientId,
  doctorId,
}) => {
  const existingPatient = await patientService.getById(patientId);

  if (!existingPatient) {
    throw Error(`There is no patient with id ${id}.`, { id });
  }

  const id = await appointmentRepo.create({
    date,
    description,
    numberOfBeds,
    condition,
    patientId,
    doctorId,
  });
  return getById(id);
};

const updateById = async (
  id,
  {
    patient,
    doctor,
    date,
    description,
    numberOfBeds,
    condition,
  }
) => {
  const patientId = Number(patient.id);
  const doctorId = Number(doctor.id);

  if (isNaN(patientId)) {
    throw Error(`Invalid patientId: ${patientId}`);
  }

  const existingPatient = await patientService.getById(patientId);

  if (!existingPatient) {
    throw Error(`There is no patient with id ${id}.`, { id });
  }

  await appointmentRepo.updateById(id, {
    patientId,
    doctorId,
    date,
    description,
    numberOfBeds,
    condition,
  });
  return getById(id);
};


const deleteById = async (id) => {
  const deleted = await appointmentRepo.deleteById(id);

  if (!deleted) {
    throw Error(`No appointment with id ${id} exists`, { id });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
