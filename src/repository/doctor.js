const { getLogger } = require("../core/logging");
const { tables, getKnex } = require("../data/index");

const formatDoctor = ({ doctorId, doctorEmail, patientRoles, ...doctor }) => {
  return {
    ...doctor,
    user: {
      id: doctorId,
      email: doctorEmail,
      roles: patientRoles,
    },
  };
};

const SELECT_COLUMNS = [
  `${tables.user}.id as doctorId`,
  `${tables.user}.email`,
  `${tables.user}.roles`,
  `${tables.doctor}.*`,
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
  photo,
  hospital,
  about,
}) => {
  try {
    const [userId] = await getKnex()(tables.user)
      .returning("id")
      .insert({
        email,
        password_hash: passwordHash,
        roles: JSON.stringify(roles),
      });

    await getKnex()(tables.doctor).insert({
      id: userId,
      name,
      speciality,
      photo,
      hospital,
      about,
    });

    return userId;
  } catch (error) {
    getLogger().error("Error in create", {
      error,
    });
    throw error;
  }
};

const register = async ({ name, email, passwordHash, roles }) => {
  try {
    const [userId] = await getKnex()(tables.user)
      .returning("id")
      .insert({
        email,
        password_hash: passwordHash,
        roles: JSON.stringify(roles),
      });

    await getKnex()(tables.doctor).insert({
      id: userId,
      name,
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
  { name, email, passwordHash, roles, speciality, photo, hospital, about }
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
        photo,
        hospital,
        about,
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
  register,
  updateById,
  deleteById,
};
