const { getLogger } = require("../core/logging");
const { tables, getKnex } = require("../data/index");

const formatAppointment = ({
  doctor_id,
  doctor_name,
  patient_id,
  patient_name,
  ...appointment
}) => {
  return {
    ...appointment,
    patient: {
      id: patient_id,
      name: patient_name,
    },
    doctor: {
      id: doctor_id,
      name: doctor_name,
    },
  };
};

const SELECT_COLUMNS = [
  `${tables.appointment}.id`,
  "description",
  "numberOfBeds",
  "condition",
  "date",
  `${tables.doctor}.id as doctor_id`,
  `${tables.doctor}.name as doctor_name`,
  `${tables.patient}.id as patient_id`,
  `${tables.patient}.name as patient_name`,
];

const findAll = async () => {
  const appointments = await getKnex()(tables.appointment)
    .join(
      tables.doctor,
      `${tables.appointment}.doctor_id`,
      "=",
      `${tables.doctor}.id`
    )
    .join(
      tables.patient,
      `${tables.appointment}.patient_id`,
      "=",
      `${tables.patient}.id`
    )
    .select(SELECT_COLUMNS)
    .orderBy("date", "ASC");

  return appointments.map(formatAppointment);
};

const findCount = async () => {
  const [count] = await getKnex()(tables.appointment).count();

  return count["count(*)"];
};

const create = async ({
  description,
  numberOfBeds,
  condition,
  date,
  doctorId,
  patientId,
}) => {
  try {
    const [id] = await getKnex()(tables.appointment).insert({
      description,
      numberOfBeds,
      condition,
      date,
      doctor_id: doctorId,
      patient_id: patientId,
    });
    return id;
  } catch (error) {
    getLogger().error("Error in create", {
      error,
    });
    throw error;
  }
};

const findById = async (id) => {
  const appointment = await getKnex()(tables.appointment)
    .join(
      tables.doctor,
      `${tables.appointment}.doctor_id`,
      "=",
      `${tables.doctor}.id`
    )
    .join(
      tables.patient,
      `${tables.appointment}.patient_id`,
      "=",
      `${tables.patient}.id`
    )
    .where(`${tables.appointment}.id`, id)
    .first(SELECT_COLUMNS);

  return appointment && formatAppointment(appointment);
};
const updateById = async (
  id,
  { description, numberOfBeds, condition, date, doctorId, patientId }
) => {
  try {
    await getKnex()(tables.appointment)
      .update({
        description,
        numberOfBeds,
        condition,
        date,
        doctor_id: doctorId,
        patient_id: patientId,
      })
      .where(`${tables.appointment}.id`, id);
    return id;
  } catch (error) {
    getLogger().error("Error in updateById", {
      error,
    });
    throw error;
  }
};

const deleteById = async (id, patientId) => {
  try {
    const rowsAffected = await getKnex()(tables.appointment)
      .where(`${tables.appointment}.id`, id)
      .delete();

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
  create,
  updateById,
  deleteById,
};
