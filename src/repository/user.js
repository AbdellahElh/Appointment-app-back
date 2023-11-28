const { getLogger } = require("../core/logging");
const { tables, getKnex } = require("../data");

const findAll = () => {
  return getKnex()(tables.user).select().orderBy("name", "ASC");
};

const findCount = async () => {
  const [count] = await getKnex()(tables.user).count();
  return count["count(*)"];
};

const findByEmail = (email) => {
  return getKnex()(tables.user).where("email", email).first();
};

const findById = (id) => {
  return getKnex()(tables.user).where("id", id).first();
};

const create = async ({ email, passwordHash, roles }) => {
  try {
    const [id] = await getKnex()(tables.user).insert({
      id,

      email,
      password_hash: passwordHash,
      roles: JSON.stringify(roles),
    });
    return id;
  } catch (error) {
    getLogger().error("Error in create", {
      error,
    });
    throw error;
  }
};

const updateById = async (id) => {
  try {
    await getKnex()(tables.user).update({}).where("id", id);
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
