const Router = require("@koa/router");
const Joi = require("joi");
const patientService = require("../service/patient");
const validate = require("../core/validation");
const { requireAuthentication, makeRequireRole } = require("../core/auth");
const Role = require("../core/roles");

const checkPatientId = (ctx, next) => {
  const { patientId, roles } = ctx.state.session;
  const { id } = ctx.params;

  // You can only get our own data unless you're an admin
  if (id !== patientId && !roles.includes(Role.ADMIN)) {
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
  const token = await patientService.login(email, password);
  ctx.body = token;
};
login.validationScheme = {
  body: {
    email: Joi.string().email(),
    password: Joi.string(),
  },
};

const getAllPatients = async (ctx) => {
  ctx.body = await patientService.getAll();
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

    street: Joi.string(),
    number: Joi.string(),
    postalCode: Joi.string(),
    city: Joi.string(),
    birthdate: Joi.date().iso(),
  },
};

// const createPatient = async (ctx) => {
//   const newPatient = await patientService.create({
//     ...ctx.request.body,
//     birthdate: new Date(ctx.request.body.birthdate),
//   });
//   ctx.status = 201;
//   ctx.body = newPatient;
// };

// createPatient.validationScheme = {
//   body: Joi.object({
//     name: Joi.string(),
//     street: Joi.string(),
//     number: Joi.string(),
//     postalCode: Joi.string(),
//     city: Joi.string(),
//     birthdate: Joi.date().iso(),
//   }),
// };

const getPatientById = async (ctx) => {
  ctx.body = await patientService.getById(Number(ctx.params.id));
};

getPatientById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
};

const updatePatientById = async (ctx) => {
  ctx.body = await patientService.updateById(Number(ctx.params.id), {
    ...ctx.request.body,
    birthdate: new Date(ctx.request.body.birthdate),
  });
};

updatePatientById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
  body: Joi.object({
    name: Joi.string(),
    street: Joi.string(),
    number: Joi.string(),
    postalCode: Joi.string(),
    city: Joi.string(),
    birthdate: Joi.date().iso(),
  }),
};

const deletePatientById = async (ctx) => {
  await patientService.deleteById(ctx.params.id);
  ctx.status = 204;
};

deletePatientById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
};

// module.exports = (app) => {
//   const router = new Router({
//     prefix: "/patients",
//   });

//   router.get("/", validate(getAllPatients.validationScheme), getAllPatients);
//   router.post("/", validate(createPatient.validationScheme), createPatient);
//   router.post("/register", validate(register.validationScheme), register);
//   router.post("/login", validate(login.validationScheme), login);
//   router.get("/:id", validate(getPatientById.validationScheme), getPatientById);
//   router.put("/:id", validate(updatePatientById.validationScheme), updatePatientById);
//   router.delete(
//     "/:id",
//     validate(deletePatientById.validationScheme),
//     deletePatientById
//   );

//   app.use(router.routes()).use(router.allowedMethods());
// };
module.exports = function installPatientsRoutes(app) {
  const router = new Router({
    prefix: "/patients",
  });

  // Public routes
  router.post("/login", validate(login.validationScheme), login);
  router.post("/register", validate(register.validationScheme), register);

  const requireAdmin = makeRequireRole(Role.ADMIN);

  // Routes with authentication/authorization
  router.get(
    "/",
    requireAuthentication,
    requireAdmin,
    validate(getAllPatients.validationScheme),
    checkPatientId,
    getAllPatients
  );
  router.get(
    "/:id",
    requireAuthentication,
    validate(getPatientById.validationScheme),
    checkPatientId,
    getPatientById
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
