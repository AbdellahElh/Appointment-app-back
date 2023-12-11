const Router = require("@koa/router");
const Joi = require("joi");

const doctorService = require("../service/doctor");
const userService = require("../service/user");
const validate = require("../core/validation");
const { requireAuthentication, makeRequireRole } = require("../core/auth");
const Role = require("../core/roles");

const checkDoctorId = (ctx, next) => {
  const { userId, roles } = ctx.state.session;
  const { id } = ctx.params;

  // Admins can access any user's information
  if (roles.includes(Role.ADMIN)) {
    return next();
  }

  // users can only access their own data
  if (id !== userId) {
    return ctx.throw(
      403,
      "You are not allowed to view this doctor's information",
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

const getAllDoctors = async (ctx) => {
  ctx.body = await doctorService.getAll();
};
getAllDoctors.validationScheme = null;

const register = async (ctx) => {
  const token = await userService.register(ctx.request.body);
  ctx.body = token;
  ctx.status = 200;
};
register.validationScheme = {
  body: {
    name: Joi.string().max(255),
    email: Joi.string().email(),
    password: Joi.string().min(8).max(30),

    speciality: Joi.string(),
    numberOfPatients: Joi.number().integer().positive(),
    photo: Joi.string(),
    hospital: Joi.string(),
    numberOfRatings: Joi.number().integer().positive(),
    rating: Joi.number().positive(),
    about: Joi.string(),
    timeSlots: Joi.array().items(
      Joi.object({
        day: Joi.string(),
        time: Joi.string(),
      })
    ),
  },
};

const getDoctorById = async (ctx) => {
  ctx.body = await doctorService.getById(ctx.params.id);
};

getDoctorById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

const updateDoctorById = async (ctx) => {
  ctx.body = await doctorService.updateById(ctx.params.id, {
    ...ctx.request.body,
  });
};

updateDoctorById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
  body: Joi.object({
    email: Joi.string().email(),
    name: Joi.string(),
    speciality: Joi.string(),
    numberOfPatients: Joi.number().integer().positive(),
    photo: Joi.string(),
    hospital: Joi.string(),
    numberOfRatings: Joi.number().integer().positive(),
    rating: Joi.number().positive(),
    about: Joi.string(),
    timeSlots: Joi.array().items(
      Joi.object({
        day: Joi.string(),
        time: Joi.string(),
      })
    ),
  }),
};

const deleteDoctorById = async (ctx) => {
  await doctorService.deleteById(ctx.params.id);
  ctx.status = 204;
};
deleteDoctorById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

module.exports = function installDoctorsRoutes(app) {
  const router = new Router({
    prefix: "/doctors",
  });

  // Public routes
  router.post("/login", validate(login.validationScheme), login);
  router.post("/register", validate(register.validationScheme), register);

  const requireAdmin = makeRequireRole(Role.ADMIN);

  // Routes with authentication/authorization
  router.get(
    "/",
    requireAuthentication,
    validate(getAllDoctors.validationScheme),
    checkDoctorId,
    getAllDoctors
  );
  router.get(
    "/:id",
    requireAuthentication,
    validate(getDoctorById.validationScheme),
    checkDoctorId,
    getDoctorById
  );
  router.put(
    "/:id",
    requireAuthentication,
    validate(updateDoctorById.validationScheme),
    checkDoctorId,
    updateDoctorById
  );
  router.delete(
    "/:id",
    requireAuthentication,
    validate(deleteDoctorById.validationScheme),
    checkDoctorId,
    deleteDoctorById
  );

  app.use(router.routes()).use(router.allowedMethods());
};
