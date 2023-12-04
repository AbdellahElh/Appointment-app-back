const { shutdownData, getKnex, tables } = require("../src/data");

module.exports = async () => {
  //Remove any leftover data
  await getKnex()(tables.appointment).delete();
  await getKnex()(tables.user).delete();
  await getKnex()(tables.patient).delete();
  await getKnex()(tables.doctor).delete();

  //Close database connection
  await shutdownData();
};
