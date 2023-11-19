// const doctorRepository = require("../repository/doctor");

// const getAll = async () => {
//   const items = await doctorRepository.findAll();
//   return {
//     items,
//     count: items.length,
//   };
// };

// const getById = async (id) => {
//   const doctor = await doctorRepository.findById(id);

//   if (!doctor) {
//     throw Error(`No doctor with id ${id} exists`, { id });
//   }

//   return doctor;
// };

// const create = async ({ name, speciality, numberOfPatients, photo }) => {
//   const id = await doctorRepository.create({
//     name,
//     speciality,
//     numberOfPatients,
//     photo,
//   });
//   return getById(id);
// };

// const updateById = async (
//   id,
//   { doctor, speciality, numberOfPatients, photo }
// ) => {
//   await doctorRepository.updateById(id, {
//     doctor,
//     speciality,
//     numberOfPatients,
//     photo,
//   });
//   return getById(id);
// };

// const deleteById = async (id) => {
//   const deleted = await doctorRepository.deleteById(id);

//   if (!deleted) {
//     throw Error(`No doctor with id ${id} exists`, { id });
//   }
// };

// module.exports = {
//   getAll,
//   getById,
//   create,
//   updateById,
//   deleteById,
// };

const doctorRepository = require("../repository/doctor");

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
    throw Error(`No doctor with id ${id} exists`, { id });
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
  return getById(id);
};

const deleteById = async (id) => {
  const deleted = await doctorRepository.deleteById(id);

  if (!deleted) {
    throw Error(`No doctor with id ${id} exists`, { id });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
