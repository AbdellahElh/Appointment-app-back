const patientRepository = require("../repository/patient");

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
    throw Error(`No patient with id ${id} exists`, { id });
  }

  return patient;
};

const create = async ({
  name,
  street,
  number,
  postalCode,
  city,
  birthdate,
}) => {
  const id = await patientRepository.create({
    name,
    street,
    number,
    postalCode,
    city,
    birthdate,
  });
  return getById(id);
};

const updateById = async (
  id,
  { name, street, number, postalCode, city, birthdate }
) => {
  await patientRepository.updateById(id, {
    name,
    street,
    number,
    postalCode,
    city,
    birthdate,
  });
  return getById(id);
};

const deleteById = async (id) => {
  const deleted = await patientRepository.deleteById(id);

  if (!deleted) {
    throw Error(`No patient with id ${id} exists`, { id });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
