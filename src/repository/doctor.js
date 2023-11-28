const { getLogger } = require("../core/logging");
const { tables, getKnex } = require("../data/index");

const formatDoctor = ({ id, email, roles, ...doctor }) => {
  return {
    ...doctor,
    user: {
      id,
      email,
      roles,
    },
  };
};

const SELECT_COLUMNS = [
  `${tables.user}.id as user_id`,
  `${tables.user}.email`,
  `${tables.user}.roles`,
  `${tables.doctor}.*`, // Include all other columns from the doctor table
];

const findAll = async () => {
  const doctors = await getKnex()(tables.doctor)
    .join(`${tables.user}`, `${tables.user}.id`, "=", `${tables.doctor}.id`)
    .select(SELECT_COLUMNS)
    .orderBy(`${tables.doctor}.name`, "ASC");

  return doctors.map(formatDoctor);
};

const findCount = async () => {
  const [count] = await getKnex()(tables.doctor).count();

  return count["count(*)"];
};

const findById = async (id) => {
  const doctor = await getKnex()(tables.doctor)
  .join(`${tables.user}`, `${tables.user}.id`, "=", `${tables.doctor}.id`)
    .where(`${tables.doctor}.id`, id)
    .first(SELECT_COLUMNS);

  return doctor && formatDoctor(doctor);
};

const findByEmail = async (email) => {
  return getKnex()(tables.user).where("email", email).first();
};

const create = async ({
  email,
  passwordHash,
  roles,
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
    const [userId] = await getKnex()(tables.user).insert({
      email,
      password_hash: passwordHash,
      roles: JSON.stringify(roles),
    });

    await getKnex()(tables.doctor).insert({
      id: userId, // Use the user's id as the doctor's id
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

    return userId;
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
    email,
    passwordHash,
    roles,
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
    await getKnex()(tables.user)
      .update({
        id,
        email,
        password_hash: passwordHash,
        roles: JSON.stringify(roles),
      })
      .where("id", id);

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
    const rowsAffected = await getKnex()(tables.user).delete().where("id", id);

    await getKnex()(tables.doctor).delete().where("id", id);

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
  findCount,
  findById,
  findByEmail,
  create,
  updateById,
  deleteById,
};
