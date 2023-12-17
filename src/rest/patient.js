const Router = require("@koa/router");
const Joi = require("joi");

const patientService = require("../service/patient");
const userService = require("../service/user");
const validate = require("../core/validation");
const { requireAuthentication, makeRequireRole } = require("../core/auth");
const Role = require("../core/roles");

const checkPatientId = (ctx, next) => {
  const { userId, roles } = ctx.state.session;
  const { id } = ctx.params;

  if (roles.includes(Role.ADMIN) || roles.includes(Role.DOCTOR)) {
    return next();
  }

  // users can only access their own data
  if (id !== userId) {
    return ctx.throw(
      403,
      "You are not allowed to view this patient's information",
      {
        code: "FORBIDDEN",
      }
    );
  }

  return next();
};

const login = async (ctx) => {
  const { email, password } = ctx.request.body;
  const token = await userService.login(email, password);
  ctx.body = token;
};
login.validationScheme = {
  body: {
    email: Joi.string().email(),
    password: Joi.string(),
  },
};

// const getAllPatients = async (ctx) => {
//   const { roles, userId } = ctx.state.session;

//   if (roles.includes(Role.PATIENT) && !roles.includes(Role.DOCTOR)) {
//     ctx.body = await patientService.getAll(userId, Role.PATIENT);
//   } else if (roles.includes(Role.DOCTOR)) {
//     ctx.body = await patientService.getAll(null, Role.DOCTOR);
//   } else if (roles.includes(Role.ADMIN)) {
//     ctx.body = await patientService.getAll(null, Role.ADMIN);
//   }
// };

const getAllPatients = async (ctx) => {
  const { roles, userId } = ctx.state.session;
  ctx.body = await patientService.getAll(userId, roles);
};

getAllPatients.validationScheme = null;

const register = async (ctx) => {
  const token = await patientService.register(ctx.request.body);
  ctx.body = token;
  ctx.status = 200;
};
register.validationScheme = {
  body: {
    name: Joi.string().max(255),
    email: Joi.string().email(),
    password: Joi.string().min(8).max(30),
  },
};

const getPatientById = async (ctx) => {
  ctx.body = await patientService.getById(ctx.params.id);
};

getPatientById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
};

const createPatient = async (ctx) => {
  const createdPatient = await patientService.create(ctx.request.body);
  ctx.body = createdPatient;
  ctx.status = 200;
};

createPatient.validationScheme = {
  body: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    street: Joi.string(),
    number: Joi.string(),
    postalCode: Joi.string(),
    city: Joi.string(),
    birthdate: Joi.date().iso(),
  }),
};

const updatePatientById = async (ctx) => {
  const { userId, roles } = ctx.state.session;
  const { id } = ctx.params;

  const updatedPatient = await patientService.updateById(
    id,
    {
      ...ctx.request.body,
    },
    userId,
    roles[0]
  );
  ctx.body = updatedPatient;
};

updatePatientById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
  body: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    street: Joi.string(),
    number: Joi.string(),
    postalCode: Joi.string(),
    city: Joi.string(),
    birthdate: Joi.date().iso(),
  }),
};

const deletePatientById = async (ctx) => {
  const { userId, roles } = ctx.state.session;
  const { id } = ctx.params;

  await patientService.deleteById(id, userId, roles[0]);
  ctx.status = 204;
};

deletePatientById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
};

module.exports = function installPatientsRoutes(app) {
  const router = new Router({
    prefix: "/patients",
  });

  // Public routes
  router.post("/login", validate(login.validationScheme), login);
  router.post("/register", validate(register.validationScheme), register);

  // Routes with authentication/authorization
  router.get(
    "/",
    requireAuthentication,
    validate(getAllPatients.validationScheme),
    // checkPatientId,
    getAllPatients
  );
  router.get(
    "/:id",
    requireAuthentication,
    validate(getPatientById.validationScheme),
    checkPatientId,
    getPatientById
  );
  router.post(
    "/",
    requireAuthentication,
    validate(createPatient.validationScheme),
    createPatient
  );
  router.put(
    "/:id",
    requireAuthentication,
    validate(updatePatientById.validationScheme),
    checkPatientId,
    updatePatientById
  );
  router.delete(
    "/:id",
    requireAuthentication,
    validate(deletePatientById.validationScheme),
    checkPatientId,
    deletePatientById
  );

  app.use(router.routes()).use(router.allowedMethods());
};
