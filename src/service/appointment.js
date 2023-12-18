const appointmentRepo = require("../repository/appointment");
const ServiceError = require("../core/serviceError");
const Role = require("../core/roles");
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

const getById = async (id, userId, roles) => {
  const appointment = await appointmentRepo.findById(id);

  if (!appointment) {
    throw ServiceError.notFound(`No appointment with id ${id} exists`, { id });
  }
  if (roles.includes(Role.PATIENT) && id !== userId && !roles.includes(Role.ADMIN)) {
    console.log("user roles: ", roles, "user id: ", userId);

    throw ServiceError.forbidden(
      `You are not allowed to view this appointment`,
      { id }
    );
  }

  if (roles.includes(Role.DOCTOR) && appointment.doctor.id !== userId && !roles.includes(Role.ADMIN)) {
    console.log("user roles: ", roles, "user id: ", userId, "appointment doctor id: ", appointment.doctor.id);
    throw ServiceError.forbidden("You are not allowed to view this appointment");
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
  roles,
  userId
) => {
  // Ensure roles is an array
  console.log("type of role: ",typeof roles);
  console.log("roles: ", roles);

  const existingPatient = patientId
  ? await patientService.getById(patientId, userId, roles)
  : null;
  if (!existingPatient) {
    throw ServiceError.notFound(`There is no patient with id ${id}.`, { id });
  }

  const existingDoctor = doctorId
  ? await doctorService.getById(doctorId, userId, roles)
  : null;
  if (!existingDoctor) {
    throw ServiceError.notFound(`There is no doctor with id ${id}.`, { id });
  }

  const appointment = await appointmentRepo.findById(id, patientId, doctorId);
  if (!appointment) {
    throw ServiceError.notFound(`There is no appointment with id ${id}.`, {
      id,
    });
  }

  if (roles.includes(Role.PATIENT) && id !== userId && !roles.includes(Role.ADMIN)) {
    console.log("user roles: ", roles, "user id: ", userId);

    throw ServiceError.forbidden(
      `You are not allowed to view this appointment`,
      { id }
    );
  }

  if (roles.includes(Role.DOCTOR) && appointment.doctor.id !== userId && !roles.includes(Role.ADMIN)) {
    console.log("user roles: ", roles, "user id: ", userId, "appointment doctor id: ", appointment.doctor.id);
    throw ServiceError.forbidden("You are not allowed to view this appointment");
  }

  try {
    await appointmentRepo.updateById(id, {
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

    const updatedAppointment = await appointmentRepo.findById(id);
    console.log("Updated appointment:", updatedAppointment);

    return updatedAppointment;
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
