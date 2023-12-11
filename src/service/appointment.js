const appointmentRepo = require("../repository/appointment");
const ServiceError = require("../core/serviceError");

const patientService = require("./patient");
const doctorService = require("./doctor");
const handleDBError = require("./_handleDBError");

const getAll = async (patientId, doctorId) => {
  const items = await appointmentRepo.findAll(patientId, doctorId);
  // const count = await appointmentRepo.count( patientId, */ doctorId);
  return {
    items,
    // count,
    count: items.length,
  };
};

const getById = async (id, /* patientId, */ /* doctorId */) => {
  const appointment = await appointmentRepo.findById(
    id, /* patientId, */ /* doctorId */
  );

  if (
    !appointment 
    // || appointment.patient.id !== patientId ||
    // appointment.doctor.id !== doctorId
  ) {
    throw ServiceError.notFound(`No appointment with id ${id} exists`, { id });
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
    throw ServiceError.notFound(`There is no patient with id ${id}.`, { id });
  }

  const existingDoctor = await doctorService.getById(doctorId);
  if (!existingDoctor) {
    throw ServiceError.notFound(`There is no doctor with id ${id}.`, { id });
  }

  try {
    const id = await appointmentRepo.create({
      date,
      description,
      numberOfBeds,
      condition,
      patientId,
      doctorId,
    });
    return getById(id, patientId, doctorId);
  } catch (error) {
    throw handleDBError(error);
  }
};

const updateById = async (
  id,
  { patientId, doctorId, date, description, numberOfBeds, condition }
) => {
  if (patientId) {
    const existingPatient = await patientService.getById(patientId);
    if (!existingPatient) {
      throw ServiceError.notFound(`There is no patient with id ${id}.`, { id });
    }
  }

  if (doctorId) {
    const existingDoctor = await doctorService.getById(doctorId);
    if (!existingDoctor) {
      throw ServiceError.notFound(`There is no doctor with id ${id}.`, { id });
    }
  }
  try {
    await appointmentRepo.updateById(id, {
      date,
      description,
      numberOfBeds,
      condition,
      patientId,
      doctorId,
    });
    console.log("Updating appointment. ID:", id, "Patient ID:", patientId, "Doctor ID:", doctorId);
    return getById(id, patientId, doctorId);

  } catch (error) {
    throw handleDBError(error);
  }
};

const deleteById = async (id, patientId, doctorId) => {
  try {
    const deleted = await appointmentRepo.deleteById(
      id,
      patientId, doctorId
    );

    if (!deleted) {
      throw ServiceError.notFound(`No appointment with id ${id} exists`, {
        id,
      });
    }
  } catch (error) {
    throw handleDBError(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
