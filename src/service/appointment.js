const appointmentRepo = require("../repository/appointment");
const ServiceError = require("../core/serviceError");

const patientService = require("./patient");
const doctorService = require("./doctor");
const handleDBError = require("./_handleDBError");

const getAll = async (userId) => {
  const items = await appointmentRepo.findAll(userId);
  return {
    items,
    count: items.length,
  };
};

const getAllAppointments = async () => {
  const items = await appointmentRepo.findAllAppointments();
  return {
    items,
    count: items.length,
  };
};

const getAllDoctorAppointments = async (userId) => {
  const items = await appointmentRepo.findAllDoctorAppointments(userId);
  return {
    items,
    count: items.length,
  };
};

const getById = async (id, userId, role) => {
  const appointment = await appointmentRepo.findById(id);

  if (!appointment) {
    throw ServiceError.notFound(`No appointment with id ${id} exists`, { id });
  }

  // Check if the user is allowed to view the appointment
  if (
    role !== "admin" &&
    appointment.patient.id !== userId &&
    appointment.doctor.id !== userId
  ) {
    throw ServiceError.forbidden(
      `You are not allowed to view this appointment`,
      { id }
    );
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
  { patientId, doctorId, date, description, numberOfBeds, condition },
  role,
  userId
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

  const appointment = await appointmentRepo.findById(id);
  if (!appointment) {
    throw ServiceError.notFound(`There is no appointment with id ${id}.`, {
      id,
    });
  }

  if (
    role !== "admin" &&
    role === "patient" &&
    userId !== appointment.patientId &&
    role === "doctor" &&
    userId !== appointment.doctorId
  ) {
    throw ServiceError.unauthorized(
      "You are not authorized to update this appointment."
    );
  }

  try {
    await appointmentRepo.findById(id, {
      patientId,
      doctorId,
      date,
      description,
      numberOfBeds,
      condition,
    });
    console.log(
      "Updating appointment. ID:",
      id,
      "Patient ID:",
      patientId,
      "Doctor ID:",
      doctorId
    );
    return getById(id, patientId, doctorId);
  } catch (error) {
    throw handleDBError(error);
  }
};

const deleteById = async (id, patientId, doctorId) => {
  try {
    const deleted = await appointmentRepo.deleteById(id, patientId, doctorId);

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
  getAllAppointments,
  getAllDoctorAppointments,
  getById,
  create,
  updateById,
  deleteById,
};
