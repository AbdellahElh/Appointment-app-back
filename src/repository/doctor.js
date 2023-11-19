// const { getLogger } = require("../core/logging");
// const { tables, getKnex } = require("../data/index");

// const findAll = () => {
//   getLogger().info("Finding all doctors");
//   return getKnex()(tables.doctor).select().orderBy("name", "ASC");
// };

// const findByName = (name) => {
//   return getKnex()(tables.doctor).where("name", name).first();
// };

// const findById = (id) => {
//   getLogger().info("Querying doctor by id", { id });
//   return getKnex()(tables.doctor).where("id", id).first();
// };

// const create = async ({ name, speciality, numberOfPatients, photo }) => {
//   try {
//     const [id] = await getKnex()(tables.doctor).insert({
//       name,
//       speciality,
//       numberOfPatients,
//       photo,
//     });

//     return id;
//   } catch (error) {
//     getLogger().error("Error in create", {
//       error,
//     });
//     throw error;
//   }
// };

// const updateById = async (
//   id,
//   { name, speciality, numberOfPatients, photo }
// ) => {
//   try {
//     await getKnex()(tables.doctor)
//       .update({
//         name,
//         speciality,
//         numberOfPatients,
//         photo,
//       })
//       .where("id", id);

//     return id;
//   } catch (error) {
//     getLogger().error("Error in updateById", {
//       error,
//     });
//     throw error;
//   }
// };

// const deleteById = async (id) => {
//   try {
//     const rowsAffected = await getKnex()(tables.doctor)
//       .delete()
//       .where("id", id);

//     return rowsAffected > 0;
//   } catch (error) {
//     getLogger().error("Error in deleteById", {
//       error,
//     });
//     throw error;
//   }
// };

// module.exports = {
//   findAll,
//   findById,
//   findByName,
//   create,
//   updateById,
//   deleteById,
// };

const { getLogger } = require("../core/logging");
const { tables, getKnex } = require("../data/index");

const findAll = () => {
  getLogger().info("Finding all doctors");
  return getKnex()(tables.doctor).select().orderBy("name", "ASC");
};

const findByName = (name) => {
  return getKnex()(tables.doctor).where("name", name).first();
};

const findById = (id) => {
  getLogger().info("Querying doctor by id", { id });
  return getKnex()(tables.doctor).where("id", id).first();
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
    const [id] = await getKnex()(tables.doctor).insert({
      name,
      speciality,
      numberOfPatients,
      photo,
      hospital,
      numberOfRatings,
      rating,
      about,
      timeSlots: JSON.stringify(timeSlots),
    });

    return id;
  } catch (error) {
    getLogger().error("Error in create", {
      error,
    });
    throw error;
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
    await getKnex()(tables.doctor)
      .update({
        name,
        speciality,
        numberOfPatients,
        photo,
        hospital,
        numberOfRatings,
        rating,
        about,
        timeSlots: JSON.stringify(timeSlots),
      })
      .where("id", id);

    return id;
  } catch (error) {
    getLogger().error("Error in updateById", {
      error,
    });
    throw error;
  }
};

const deleteById = async (id) => {
  try {
    const rowsAffected = await getKnex()(tables.doctor)
      .delete()
      .where("id", id);

    return rowsAffected > 0;
  } catch (error) {
    getLogger().error("Error in deleteById", {
      error,
    });
    throw error;
  }
};

module.exports = {
  findAll,
  findById,
  findByName,
  create,
  updateById,
  deleteById,
};
