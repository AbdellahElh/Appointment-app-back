const appointmentRepo = require("../repository/appointment");
const patientService = require("./patient");
const ServiceError = require("../core/serviceError");
const handleDBError = require("./_handleDBError");

const getAll = async () => {
  const items = await appointmentRepo.findAll();
  return {
    items,
    count: items.length,
  };
};

const getById = async (id) => {
  const appointment = await appointmentRepo.findById(id);

  if (!appointment) {
    // throw new Error(`There is no appointment with id ${id}`); // 👈 2
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
    throw ServiceError.notFound(`There is no patient with id ${id}.`, { id }); //er is meer info, drm niet verwijderen
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
    return getById(id);
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
  try {
    await appointmentRepo.updateById(id, {
      patientId,
      doctorId,
      date,
      description,
      numberOfBeds,
      condition,
    });
    return getById(id);
  } catch (error) {
    throw handleDBError(error);
  }
};

const deleteById = async (id) => {
  const deleted = await appointmentRepo.deleteById(id);

  if (!deleted) {
    throw ServiceError.notFound(`No appointment with id ${id} exists`, { id });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
