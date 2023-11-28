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
    patient: makeExposedPatient(patient),
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
    const { roles, patientId } = await verifyJWT(authToken);

    return {
      patientId,
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
    throw ServiceError.unauthorized(
      "The given email and password do not match"
    );
  }

  const passwordValid = await verifyPassword(password, patient.password_hash);

  if (!passwordValid) {
    throw ServiceError.unauthorized(
      "The given email and password do not match"
    );
  }

  return await makeLoginData(patient);
};

const getAll = async () => {
  const items = await patientRepository.findAll();
  return {
    items: items.map(makeExposedPatient),
    count: items.length,
  };
};

const getById = async (id) => {
  const patient = await patientRepository.findById(id);

  if (!patient) {
    throw ServiceError.notFound(`No patient with id ${id} exists`, { id });
  }

  return makeExposedPatient(patient);
};

const register = async ({
  email,
  password,
  name,
  street,
  number,
  postalCode,
  city,
  birthdate,
}) => {
  try {
    const passwordHash = await hashPassword(password);

    const patientId = await patientRepository.create({
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
    const patient = await patientRepository.findById(patientId);
    return await makeLoginData(patient);
  } catch (error) {
    throw handleDBError(error);
  }
};

const updateById = async (
  id,
  { email, name, street, number, postalCode, city, birthdate }
) => {
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
    return getById(id);
  } catch (error) {
    throw handleDBError(error);
  }
};

const deleteById = async (id) => {
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
  // create,
  register,
  updateById,
  deleteById,
};
