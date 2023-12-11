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


const findAll = async (patientId, doctorId) => {
  const query = getKnex()(tables.appointment)
    .join(
      tables.doctor,
      `${tables.appointment}.doctor_id`,
      "=",
      `${tables.doctor}.id`
      // `${tables.user}.id`
    )
    .join(
      tables.patient,
      `${tables.appointment}.patient_id`,
      "=",
      `${tables.patient}.id`
      // `${tables.user}.id`
    )
    .select(SELECT_COLUMNS)
    // .where(`${tables.appointment}.patient_id`, patientId)
    // .where(`${tables.appointment}.doctor_id`, doctorId)
    .orderBy("date", "ASC");

  console.log(query.toSQL().toNative());

  const appointments = await query;

  return appointments.map(formatAppointment);
};

// const findCount = async (/* patientId,  */doctorId) => {
//   const [count] = await getKnex()(tables.appointment)
//     .count()
//     // .where(`${tables.appointment}.patient_id`, patientId)
//     .where(`${tables.appointment}.doctor_id`, doctorId);
//   return count["count(*)"];
// };

const findById = async (id /*, patientId, doctorId */) => {
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
    // .where(`${tables.appointment}.patient_id`, patientId)
    // .where(`${tables.appointment}.doctor_id`, doctorId)
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
    return id;
  } catch (error) {
    getLogger().error("Error in updateById", {
      error,
    });
    throw error;
  }
};

const deleteById = async (id, /* doctorId */ /*, patientId  */) => {
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
  // findCount,
  findById,
  create,
  updateById,
  deleteById,
};

// const { getLogger } = require("../core/logging");
// const { tables, getKnex } = require("../data/index");

// const formatAppointment = ({
//   doctor_id,
//   doctor_name,
//   patient_id,
//   patient_name,
//   ...appointment
// }) => {
//   return {
//     ...appointment,
//     patient: {
//       id: patient_id,
//       name: patient_name,
//     },
//     doctor: {
//       id: doctor_id,
//       name: doctor_name,
//     },
//   };
// };

// const SELECT_COLUMNS = [
//   `${tables.appointment}.id`,
//   "description",
//   "numberOfBeds",
//   "condition",
//   "date",
//   "doctor.id as doctor_id",
//   "doctor.name as doctor_name",
//   "patient.id as patient_id",
//   "patient.name as patient_name",
// ];

// const findAll = async (doctorId) => {
//   const query = getKnex()(tables.appointment)
//     .join(
//       { doctor: tables.user },
//       `${tables.appointment}.doctor_id`,
//       "=",
//       'doctor.id'
//     )
//     .join(
//       { patient: tables.user },
//       `${tables.appointment}.patient_id`,
//       "=",
//       'patient.id'
//     )
//     .select(SELECT_COLUMNS)
//     .where('doctor.id', doctorId)
//     .orderBy("date", "ASC");

//   console.log(query.toSQL().toNative());

//   const appointments = await query;

//   return appointments.map(formatAppointment);
// };


// const findCount = async (doctorId) => {
//   const [count] = await getKnex()(tables.appointment)
//     .count()
//     .where(`${tables.appointment}.doctor_id`, doctorId);
//   return count["count(*)"];
// };

// const findById = async (id) => {
//   const appointment = await getKnex()(tables.appointment)
//     .join(
//       tables.user,
//       `${tables.appointment}.doctor_id`,
//       "=",
//       `${tables.user}.id`
//     )
//     .join(
//       tables.user,
//       `${tables.appointment}.patient_id`,
//       "=",
//       `${tables.user}.id`
//     )
//     .where(`${tables.appointment}.id`, id)
//     .first(SELECT_COLUMNS);

//   return appointment && formatAppointment(appointment);
// };

// const create = async ({
//   description,
//   numberOfBeds,
//   condition,
//   date,
//   doctorId,
//   patientId,
// }) => {
//   try {
//     const [id] = await getKnex()(tables.appointment).insert({
//       description,
//       numberOfBeds,
//       condition,
//       date,
//       doctor_id: doctorId,
//       patient_id: patientId,
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
//   { patientId, doctorId, date, description, numberOfBeds, condition }
// ) => {
//   try {
//     await getKnex()(tables.appointment)
//       .update({
//         date,
//         description,
//         numberOfBeds,
//         condition,
//         patient_id: patientId,
//         doctor_id: doctorId,
//       })
//       .where(`${tables.appointment}.id`, id);
//     return id;
//   } catch (error) {
//     getLogger().error("Error in updateById", {
//       error,
//     });
//     throw error;
//   }
// };

// const deleteById = async (id, doctorId) => {
//   try {
//     const rowsAffected = await getKnex()(tables.appointment)
//       .where(`${tables.appointment}.id`, id)
//       .where(`${tables.appointment}.doctor_id`, doctorId)
//       .delete();

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
//   findCount,
//   findById,
//   create,
//   updateById,
//   deleteById,
// };
