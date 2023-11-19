const { getLogger } = require("../core/logging");
const { tables, getKnex } = require("../data/index");

const findAll = () => {
  getLogger().info("Finding all patients");
  return getKnex()(tables.patient).select().orderBy("name", "ASC");
};

const findByName = (name) => {
  return getKnex()(tables.patient).where("name", name).first();
};

const findById = (id) => {
  getLogger().info("Querying patient by id", { id });
  return getKnex()(tables.patient).where("id", id).first();
};

const create = async ({
  name,
  street,
  number,
  postalCode,
  city,

  birthdate,
}) => {
  try {
    const [id] = await getKnex()(tables.patient).insert({
      name,
      street,
      number,
      postalCode,
      city,

      birthdate,
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
  { name, street, number, postalCode, city, birthdate }
) => {
  try {
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
    const rowsAffected = await getKnex()(tables.patient)
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
