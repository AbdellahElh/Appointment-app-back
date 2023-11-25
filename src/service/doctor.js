const doctorRepository = require("../repository/doctor");
const ServiceError = require("../core/serviceError");
const handleDBError = require("./_handleDBError");

const getAll = async () => {
  const items = await doctorRepository.findAll();
  return {
    items,
    count: items.length,
  };
};

const getById = async (id) => {
  const doctor = await doctorRepository.findById(id);

  if (!doctor) {
    throw ServiceError.notFound(`No doctor with id ${id} exists`, { id });
  }

  return doctor;
};

const create = async ({
  name,
  speciality,
  numberOfPatients,
  photo,
  hospital,
  numberOfRatings,
  rating,
  about,
  timeSlots,
}) => {
  try {
    const id = await doctorRepository.create({
      name,
      speciality,
      numberOfPatients,
      photo,
      hospital,
      numberOfRatings,
      rating,
      about,
      timeSlots,
    });
    return getById(id);
  } catch (error) {
    throw handleDBError(error);
  }
};

const updateById = async (
  id,
  {
    name,
    speciality,
    numberOfPatients,
    photo,
    hospital,
    numberOfRatings,
    rating,
    about,
    timeSlots,
  }
) => {
  try {
    await doctorRepository.updateById(id, {
      name,
      speciality,
      numberOfPatients,
      photo,
      hospital,
      numberOfRatings,
      rating,
      about,
      timeSlots,
    });
  } catch (error) {
    throw handleDBError(error);
  }

  return getById(id);
};

const deleteById = async (id) => {
  const deleted = await doctorRepository.deleteById(id);

  if (!deleted) {
    throw ServiceError.notFound(`No doctor with id ${id} exists`, { id });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
