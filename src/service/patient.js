const patientRepository = require('../repository/patient');
const ServiceError = require('../core/serviceError');
const handleDBError = require('./_handleDBError');

const getAll = async () => {
  const items = await patientRepository.findAll();
  return {
    items,
    count: items.length,
  };
};

const getById = async (id) => {
  const patient = await patientRepository.findById(id);

  if (!patient) {
    throw ServiceError.notFound(`No patient with id ${id} exists`, { id });
  }

  return patient;
};

const create = async ({ name, street, number, postalCode, city, birthdate }) => {
  try {
    const id = await patientRepository.create({
      name,
      street,
      number,
      postalCode,
      city,
      birthdate,
    });
    return getById(id);
  } catch (error) {
    throw handleDBError(error);
  }
};

const updateById = async (
  id,
  { name, street, number, postalCode, city, birthdate }
) => {
  try {
    await patientRepository.updateById(id, {
      name,
      street,
      number,
      postalCode,
      city,
      birthdate,
    });
  } catch (error) {
    throw handleDBError(error);
  }
  return getById(id);
};

const deleteById = async (id) => {
  const deleted = await patientRepository.deleteById(id);

  if (!deleted) {
    throw ServiceError.notFound(`No patient with id ${id} exists`, { id });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
