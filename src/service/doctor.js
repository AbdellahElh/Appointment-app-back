const config = require("config");

const doctorRepository = require("../repository/doctor");
const ServiceError = require("../core/serviceError");
const { hashPassword, verifyPassword } = require("../core/password");
const { generateJWT, verifyJWT } = require("../core/jwt");
const Role = require("../core/roles");
const { getLogger } = require("../core/logging");

const handleDBError = require("./_handleDBError");

const makeExposedDoctor = ({
  id,
  email,
  roles,
  name,
  speciality,
  photo,
  hospital,
  about,
}) => ({
  id,
  email,
  roles,
  name,
  speciality,
  photo,
  hospital,
  about,
});

const makeLoginData = async (doctor) => {
  const token = await generateJWT(doctor);
  return {
    user: makeExposedDoctor(doctor),
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
    const { roles, doctorId } = await verifyJWT(authToken);

    return {
      doctorId,
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
  const doctor = await doctorRepository.findByEmail(email);

  if (!doctor) {
    throw ServiceError.unauthorized(
      "Email not found. Please sign up if you're a new user."
      );
  }

  const passwordValid = await verifyPassword(password, doctor.password_hash);

  if (!passwordValid) {
    throw ServiceError.unauthorized(
      "The password you entered is incorrect. Please check and try again."
    );
  }

  return await makeLoginData(doctor);
};

const getAll = async () => {
  const items = await doctorRepository.findAll();
  return {
    items: items.map(makeExposedDoctor),
    count: items.length,
  };
};

const getById = async (id) => {
  const doctor = await doctorRepository.findById(id);

  if (!doctor) {
    throw ServiceError.notFound(`No doctor with id ${id} exists`, { id });
  }

  return makeExposedDoctor(doctor);
};

const register = async ({ name, email, password }) => {
  try {
    const passwordHash = await hashPassword(password);

    const doctorId = await doctorRepository.register({
      name,
      email,
      passwordHash,
      roles: [Role.DOCTOR],
    });
    const doctor = await doctorRepository.findById(doctorId);
    return await makeLoginData(doctor);
  } catch (error) {
    throw handleDBError(error);
  }
};

const updateById = async (
  id,
  { email, name, speciality, photo, hospital, about }
) => {
  try {
    await doctorRepository.updateById(id, {
      email,
      name,
      speciality,
      photo,
      hospital,
      about,
    });
    return getById(id);
  } catch (error) {
    throw handleDBError(error);
  }
};

const deleteById = async (id) => {
  try {
    const deleted = await doctorRepository.deleteById(id);

    if (!deleted) {
      throw ServiceError.notFound(`No doctor with id ${id} exists`, { id });
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
  register,
  updateById,
  deleteById,
};
