const userRepository = require("../repository/user");
const ServiceError = require("../core/serviceError");
const { hashPassword, verifyPassword } = require("../core/password");
const { generateJWT, verifyJWT } = require("../core/jwt");
const Role = require("../core/roles");
const { getLogger } = require("../core/logging");

const handleDBError = require("./_handleDBError");

const makeExposedUser = ({ id, email, roles }) => ({
  id,
  email,
  roles,
});

const makeLoginData = async (user) => {
  const token = await generateJWT(user);
  return {
    user: makeExposedUser(user),
    token,
  };
};

const checkAndParseSession = async (authHeader) => {
  if (!authHeader) {
    throw ServiceError.unauthorized('You need to be signed in');
  } 

  if (!authHeader.startsWith('Bearer ')) {
    throw ServiceError.unauthorized('Invalid authentication token');
  }

  const authToken = authHeader.substring(7);
  try {
    const { roles, userId, isDoctor } = await verifyJWT(authToken);

    return {
      userId,
      isDoctor,
      roles,
      authToken,
    };
  } catch (error) {
    getLogger().error(error.message, { error });
    throw new Error(error.message); //we trowen een tijdelijk 500
  }
};

const checkRole = (role, roles) => {
  const hasPermission = roles.includes(role);

  if (!hasPermission) {
    getLogger().error("User roles:", roles );
    throw ServiceError.forbidden(
      "You are not allowed to view this part of the application"
    );
  }
};

const login = async (email, password) => {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw ServiceError.unauthorized(
      "The given email and password do not match"
    );
  }

  const passwordValid = await verifyPassword(password, user.password_hash);

  if (!passwordValid) {
    throw ServiceError.unauthorized(
      "The given email and password do not match"
    );
  }

  return await makeLoginData(user);
};

const getAll = async () => {
  const items = await userRepository.findAll();
  return {
    items: items.map(makeExposedUser),
    count: items.length,
  };
};

const register = async ({ email, password }) => {
  try {
    const passwordHash = await hashPassword(password);

    const userId = await userRepository.create({
      email,
      passwordHash,
      roles: [Role.USER], 
    });
    const user = await userRepository.findById(userId);
    return await makeLoginData(user);
  } catch (error) {
    throw handleDBError(error);
  }
};

const deleteById = async (id) => {
  try {
    const deleted = await userRepository.deleteById(id);

    if (!deleted) {
      throw ServiceError.notFound(`No user with id ${id} exists`, { id });
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
  register,
  deleteById,
};
