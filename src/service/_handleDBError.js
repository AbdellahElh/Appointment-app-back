const ServiceError = require("../core/serviceError");

const handleDBError = (error) => {
  const { code = "", sqlMessage } = error;

  if (code === "ER_DUP_ENTRY") {
    switch (true) {
      // case sqlMessage.includes("idx_patient_name_unique"):
      //   return ServiceError.validationFailed(
      //     "A patient with this name already exists"
      //   );
      // case sqlMessage.includes("idx_doctor_email_unique"):
      //   return ServiceError.validationFailed(
      //     "There is already a doctor with this email address"
      //   );
      default:
        return ServiceError.validationFailed("This item already exists");
    }
  }

  if (code.startsWith("ER_NO_REFERENCED_ROW")) {
    switch (true) {
      case sqlMessage.includes("fk_appointment_doctor"):
        return ServiceError.notFound("This doctor does not exist");
      case sqlMessage.includes("fk_appointment_patient"):
        return ServiceError.notFound("This patient does not exist");
    }
  }

  // Return error because we don't know what happened
  return error;
};

module.exports = handleDBError;
