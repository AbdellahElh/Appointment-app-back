const appointmentRepo = require("../repository/appointment");
const ServiceError = require("../core/serviceError");
const Role = require("../core/roles");
const patientService = require("./patient");
const doctorService = require("./doctor");
const handleDBError = require("./_handleDBError");

const getAll = async (userId, roles) => {
  console.log("getAll called with userId: ", userId, "and roles: ", roles);
  console.log("Role.PATIENT is: ", Role.PATIENT);

  let items;

  if (roles.includes(Role.PATIENT) && !roles.includes(Role.ADMIN)) {
    console.log("Handling PATIENT role");
    items = await appointmentRepo.findAll(userId);
  } else if (roles.includes(Role.DOCTOR) && !roles.includes(Role.ADMIN)) {
    console.log("Handling DOCTOR role");
    items = await appointmentRepo.findAllDoctorAppointments(userId);
  } else if (
    roles.includes(Role.PATIENT) &&
    roles.includes(Role.DOCTOR) &&
    !roles.includes(Role.ADMIN)
  ) {
    console.log("Handling PATIENT and DOCTOR roles");
    items = [
      ...(await appointmentRepo.findAll(userId)),
      ...(await appointmentRepo.findAllDoctorAppointments(userId)),
    ];
  } else {
    console.log("admin user roles: ", roles, "user id: ", userId);
    items = await appointmentRepo.findAllAppointments();
  }

  console.log("Returning ", items.length, " items");

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
  if (
    roles.includes(Role.PATIENT) &&
    appointment.patient.id !== userId &&
    !roles.includes(Role.ADMIN)
  ) {
    console.log("user roles: ", roles, "user id: ", userId);

    throw ServiceError.forbidden(
      `You are not allowed to view this appointment`,
      { id }
    );
  }

  if (
    roles.includes(Role.DOCTOR) &&
    appointment.doctor.id !== userId &&
    !roles.includes(Role.ADMIN)
  ) {
    console.log(
      "user roles: ",
      roles,
      "user id: ",
      userId,
      "appointment doctor id: ",
      appointment.doctor.id
    );
    throw ServiceError.forbidden(
      "You are not allowed to view this appointment"
    );
  }

  return appointment;
};

const create = async (
  { patientId, doctorId, date, description, numberOfBeds, condition },
  userId,
  roles
) => {
  const existingPatient = await patientService.getById(
    patientId,
    userId,
    roles
  );
  if (!existingPatient) {
    throw ServiceError.notFound(`There is no patient with id ${patientId}.`, {
      patientId,
    });
  }

  const existingDoctor = await doctorService.getById(doctorId, userId, roles);
  if (!existingDoctor) {
    throw ServiceError.notFound(`There is no doctor with id ${doctorId}.`, {
      doctorId,
    });
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
    return getById(id, roles, userId);
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
  console.log("type of role: ", typeof roles);
  console.log("roles: ", roles);

  const existingPatient = patientId
    ? await patientService.getById(patientId, roles, userId)
    : null;
  if (!existingPatient) {
    throw ServiceError.notFound(`There is no patient with id ${id}.`, { id });
  }

  const existingDoctor = doctorId
    ? await doctorService.getById(doctorId, roles, userId)
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

  if (roles.includes(Role.PATIENT) && appointment.patient.id !== userId && !roles.includes(Role.ADMIN)) {
    console.log("user roles: ", roles, "user id: ", userId);

    throw ServiceError.forbidden(
      `You are not allowed to view this appointment`,
      { id }
    );
  }

  if (
    roles.includes(Role.DOCTOR) &&
    appointment.doctor.id !== userId &&
    !roles.includes(Role.ADMIN)
  ) {
    console.log(
      "user roles: ",
      roles,
      "user id: ",
      userId,
      "appointment doctor id: ",
      appointment.doctor.id
    );
    throw ServiceError.forbidden(
      "You are not allowed to view this appointment"
    );
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
  getById,
  create,
  updateById,
  deleteById,
};
