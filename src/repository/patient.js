const { getLogger } = require("../core/logging");
const { tables, getKnex } = require("../data/index");

const formatPatient = ({ patientId, patientEmail, patientRoles, ...patient }) => {
  return {
    ...patient,
    user: {
      id: patientId,
      email: patientEmail,
      roles: patientRoles,
    },
  };
};

const SELECT_COLUMNS = [
  `${tables.user}.id as patient_id`,
  `${tables.user}.email`,
  `${tables.user}.roles`,
  `${tables.patient}.*`, // Include all other columns from the patient table
];

const findAll = async () => {
  const patients = await getKnex()(tables.patient)
    .join(tables.user, `${tables.user}.id`, "=", `${tables.patient}.id`)
    .select(SELECT_COLUMNS)
    .orderBy(`${tables.patient}.name`, "ASC");

  return patients.map(formatPatient);
};

const findCount = async () => {
  const [count] = await getKnex()(tables.patient).count();

  return count["count(*)"];
};

const findById = async (id) => {
  const patient = await getKnex()(tables.patient)
    .join(tables.user, `${tables.user}.id`, "=", `${tables.patient}.id`)
    .where(`${tables.patient}.id`, id)
    .first(SELECT_COLUMNS);

  return patient && formatPatient(patient);
};

const findByEmail = async (email) => {
  return getKnex()(tables.user).where("email", email).first();
};

const create = async ({
  email,
  passwordHash,
  roles,
  name,
  street,
  number,
  postalCode,
  city,
  birthdate,
}) => {
  try {
    const [userId] = await getKnex()(tables.user).insert({
      email,
      password_hash: passwordHash,
      roles: JSON.stringify(roles),
    });

    await getKnex()(tables.patient).insert({
      id: userId, // Use the user's id as the patient's id
      name,
      street,
      number,
      postalCode,
      city,
      birthdate,
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
    street,
    number,
    postalCode,
    city,
    birthdate,
  }
) => {
  try {
    // Update user table
    await getKnex()(tables.user)
      .update({
        id,
        email,
        password_hash: passwordHash,
        roles: JSON.stringify(roles),
      })
      .where("id", id);

    // Update patient table
    await getKnex()(tables.patient)
      .update({
        name,
        street,
        number,
        postalCode,
        city,
        birthdate,
      })
      .where("id", id);

    // Fetch and return the updated patient information
    const updatedPatient = await findById(id);
    return updatedPatient;
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

    await getKnex()(tables.patient).delete().where("id", id);

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
