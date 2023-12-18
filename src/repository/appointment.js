const { getLogger } = require("../core/logging");
const { tables, getKnex } = require("../data/index");

const formatAppointment = (appointment) => {
  return {
    id: appointment.id,
    description: appointment.description,
    numberOfBeds: appointment.numberOfBeds,
    condition: appointment.condition,
    date: appointment.date,
    patient: {
      id: appointment.patient_id,
      name: appointment.patient_name,
    },
    doctor: {
      id: appointment.doctor_id,
      name: appointment.doctor_name,
    },
  };
};

const SELECT_COLUMNS = [
  `${tables.appointment}.id`,
  "description",
  "numberOfBeds",
  "condition",
  "date",
  "appointment.patient_id",
  "appointment.doctor_id",
  `${tables.doctor}.id as doctor_id`,
  `${tables.doctor}.name as doctor_name`,
  `${tables.patient}.id as patient_id`,
  `${tables.patient}.name as patient_name`,
];

const findAll = async (userId) => {
  console.log(`findAll called with userId: ${userId}`);

  const query = getKnex()(tables.appointment)
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
    .where(`${tables.appointment}.patient_id`, userId)
    .orderBy("date", "ASC");

  console.log(query.toSQL().toNative());

  const appointments = await query;

  console.log(`findAll returned ${appointments.length} appointments`);

  return appointments.map(formatAppointment);
};

const findAllAppointments = async () => {
  console.log(`findAllAppointments called`);

  const query = getKnex()(tables.appointment)
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

  console.log(query.toSQL().toNative());

  const appointments = await query;

  console.log(`findAllAppointments returned ${appointments.length} appointments`);


  return appointments.map(formatAppointment);
};

const findAllDoctorAppointments = async (userId) => {
  console.log(`findAllDoctorAppointments called with userId: ${userId}`);

  const query = getKnex()(tables.appointment)
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
    .where(`${tables.appointment}.doctor_id`, userId)
    .orderBy("date", "ASC");

  console.log(query.toSQL().toNative());

  const appointments = await query;

  console.log(`findAllDoctorAppointments returned ${appointments.length} appointments`);

  return appointments.map(formatAppointment);
};

// const findById = async (id /*, patientId, doctorId */) => {
//   const appointment = await getKnex()(tables.appointment)
//     .join(
//       tables.doctor,
//       `${tables.appointment}.doctor_id`,
//       "=",
//       `${tables.doctor}.id`
//     )
//     .join(
//       tables.patient,
//       `${tables.appointment}.patient_id`,
//       "=",
//       `${tables.patient}.id`
//     )
//     .where(`${tables.appointment}.id`, id)
//     // .where(`${tables.appointment}.patient_id`, patientId)
//     // .where(`${tables.appointment}.doctor_id`, doctorId)
//     .first(SELECT_COLUMNS);

//   return appointment && formatAppointment(appointment);
// };

const findById = async (id) => {
  console.log(`Fetching appointment with id ${id}`);

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

const updateById = async (
  id,
  { patientId, doctorId, date, description, numberOfBeds, condition }
) => {
  try {
    await getKnex()(tables.appointment)
      .update({
        date,
        description,
        numberOfBeds,
        condition,
        patient_id: patientId,
        doctor_id: doctorId,
      })
      .where(`${tables.appointment}.id`, id);

    const updatedAppointment = await getKnex()(tables.appointment)
      .select("*")
      .where(`${tables.appointment}.id`, id)
      .first();

    return updatedAppointment;
  } catch (error) {
    getLogger().error("Error in updateById", {
      error,
    });
    throw error;
  }
};

const deleteById = async (id /* doctorId */ /*, patientId  */) => {
  try {
    const rowsAffected = await getKnex()(tables.appointment)
      .where(`${tables.appointment}.id`, id)
      // .where(`${tables.appointment}.patient_id`, patientId)
      // .where(`${tables.appointment}.doctor_id`, doctorId)
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
  findAllAppointments,
  findAllDoctorAppointments,
  findById,
  create,
  updateById,
  deleteById,
};
