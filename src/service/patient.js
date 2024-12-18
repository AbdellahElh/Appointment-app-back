const config = require("config");

const patientRepository = require("../repository/patient");
const ServiceError = require("../core/serviceError");
const { hashPassword, verifyPassword } = require("../core/password");
const { generateJWT, verifyJWT } = require("../core/jwt");
const Role = require("../core/roles");
const { getLogger } = require("../core/logging");

const handleDBError = require("./_handleDBError");

const makeExposedPatient = ({
  id,
  email,
  roles,
  name,
  street,
  number,
  postalCode,
  city,
  birthdate,
}) => ({
  id,
  email,
  roles,
  name,
  street,
  number,
  postalCode,
  city,
  birthdate,
});

const makeLoginData = async (patient) => {
  const token = await generateJWT(patient);
  return {
    user: makeExposedPatient(patient),
    token,
  };
};

const checkAndParseSession = async (authHeader) => {
  if (!authHeader) {
    throw ServiceError.unauthorized("You need to be signed in");
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw ServiceError.unauthorized("Invalid authentication token");
  }

  const authToken = authHeader.substring(7);
  try {
    const { roles, userId } = await verifyJWT(authToken);

    return {
      patientId: userId,
      roles,
      authToken,
    };
  } catch (error) {
    getLogger().error(error.message, { error });
    throw new Error(error.message);
  }
};

const checkRole = (role, roles) => {
  const hasPermission = roles.includes(role);

  if (!hasPermission) {
    throw ServiceError.forbidden(
      "You are not allowed to view this part of the application"
    );
  }
};

const login = async (email, password) => {
  const patient = await patientRepository.findByEmail(email);

  if (!patient) {
    // getLogger().error("User roles:", roles);
    throw ServiceError.unauthorized(
      "Email not found. Please sign up if you're a new user."
    );
  }

  const passwordValid = await verifyPassword(password, patient.password_hash);

  if (!passwordValid) {
    throw ServiceError.unauthorized(
      "The password you entered is incorrect. Please check and try again."
    );
  }

  return await makeLoginData(patient);
};

// const getAll = async () => {
//   const items = await patientRepository.findAll();
//   return {
//     items: items.map(makeExposedPatient),
//     count: items.length,
//   };
// };

const getAll = async (userId, roles) => {
  let items = [];
  if (roles.includes(Role.PATIENT) && !roles.includes(Role.ADMIN)) {
    console.log("patient user roles", roles);
    const patient = await patientRepository.findById(userId);
    items = patient ? [patient] : [];
  } 
  else if (roles.includes(Role.DOCTOR) && !roles.includes(Role.ADMIN)) {
    console.log("doctor user roles", roles);
    items = await patientRepository.findByDoctorId(userId);
  } 
  else {
    console.log("admin user roles", roles);
    items = await patientRepository.findAll();
  }

  // Remove duplicates
  const uniqueItems = Array.from(new Set(items.map((item) => item.id))).map(
    (id) => items.find((item) => item.id === id)
  );

  return {
    items: uniqueItems.map(makeExposedPatient),
    count: uniqueItems.length,
  };
};

const getById = async (id, roles, userId) => {
  console.log("getById: id, userId, roles", id, userId, roles);

  const patient = await patientRepository.findById(id);

  if (!patient) {
    throw ServiceError.notFound(`No patient with id ${id} exists`, { id });
  }

  if (
    roles.includes(Role.PATIENT) &&
    id !== userId &&
    !roles.includes(Role.ADMIN)
  ) {
    throw ServiceError.forbidden(
      "You are not allowed to view this patient's information"
    );
  }

  return makeExposedPatient(patient);
};

const create = async ({
  name,
  email,
  password,
  street,
  number,
  postalCode,
  city,
  birthdate,
}) => {
  try {
    const passwordHash = await hashPassword(password);

    const id = await patientRepository.create({
      name,
      email,
      passwordHash,
      roles: [Role.PATIENT],
      street,
      number,
      postalCode,
      city,
      birthdate,
    });
    const patient = await patientRepository.findById(id);
    console.log("User created:", patient);
    return getById(id, patient.roles, patient.id);
  } catch (error) {
    throw handleDBError(error);
  }
};

const register = async ({ email, password, name }) => {
  try {
    const passwordHash = await hashPassword(password);

    const patientId = await patientRepository.register({
      name,
      email,
      passwordHash,
      roles: [Role.PATIENT],
    });
    const patient = await patientRepository.findById(patientId);
    console.log("User created:", patient);

    return await makeLoginData(patient);
  } catch (error) {
    throw handleDBError(error);
  }
};

const updateById = async (
  id,
  { email, name, street, number, postalCode, city, birthdate },
  userId,
  roles
) => {
  console.log("updateById; id, roles, userId", id, roles, userId);
  if (roles.includes(Role.DOCTOR) && !roles.includes(Role.ADMIN)) {
    throw ServiceError.forbidden(
      "You are not allowed to update this patient's information"
    );
  }

  try {
    await patientRepository.updateById(id, {
      email,
      name,
      street,
      number,
      postalCode,
      city,
      birthdate,
    });
    return getById(id, roles, userId);
  } catch (error) {
    throw handleDBError(error);
  }
};

const deleteById = async (id, userId, roles) => {
  console.log("deleteById", id, userId, roles);
  if (roles.includes(Role.DOCTOR) && !roles.includes(Role.ADMIN)) {
    throw ServiceError.forbidden(
      "You are not allowed to delete this patient's information"
    );
  }

  try {
    const deleted = await patientRepository.deleteById(id);

    if (!deleted) {
      throw ServiceError.notFound(`No patient with id ${id} exists`, { id });
    }
  } catch (error) {
    throw handleDBError(error);
  }
};

module.exports = {
  checkAndParseSession,
  checkRole,
  login,
  getAll,
  getById,
  create,
  register,
  updateById,
  deleteById,
};
