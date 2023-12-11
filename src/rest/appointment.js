const Router = require("@koa/router");
const Joi = require("joi");

const validate = require("../core/validation");
const { requireAuthentication } = require("../core/auth");
const Role = require("../core/roles");
const appointmentService = require("../service/appointment");

const checkAppointmentId = async (ctx, next) => {
  const { userId, roles } = ctx.state.session;
  const { id } = ctx.params;

  // Fetch the appointment data
  const appointment = await appointmentService.getById(id);

  if (roles.includes(Role.ADMIN)) {
    return next();
  }
  if (roles.includes(Role.DOCTOR) && appointment.doctor.id === userId) {
    return next();
  }
  if (roles.includes(Role.PATIENT) && appointment.patient.id === userId) {
    return next();
  }

  return ctx.throw(403, "You are not allowed to view this appointment", {
    code: "FORBIDDEN",
  });
};

const getAllAppointments = async (ctx) => {
  // const { patientId, doctorId } = ctx.state.session;
  ctx.body = await appointmentService.getAll(/* patientId, doctorId */);
};

getAllAppointments.validationScheme = null;

const createAppointment = async (ctx) => {
  const newAppointment = await appointmentService.create({
    ...ctx.request.body,
    date: new Date(ctx.request.body.date),
    condition: ctx.request.body.condition,
    description: ctx.request.body.description,
    numberOfBeds: ctx.request.body.numberOfBeds,
    patientId: ctx.request.body.patientId,
    doctorId: ctx.request.body.doctorId,
    // patientId: ctx.state.session.patientId,
    // doctorId: ctx.state.session.doctorId,
  });

  ctx.status = 201;
  ctx.body = newAppointment;
};

createAppointment.validationScheme = {
  body: Joi.object({
    description: Joi.string(),
    numberOfBeds: Joi.number().integer().positive(),
    condition: Joi.string(),
    date: Joi.date().iso(),
    patientId: Joi.number().integer().positive(),
    doctorId: Joi.number().integer().positive(),
  }),
};

const getAppointmentById = async (ctx) => {
  // const { /* patientId, */ doctorId } = ctx.state.session;
  ctx.body = await appointmentService.getById(
    ctx.params.id
    /* patientId, */
    // ctx.state.session.doctorId
  );
};

getAppointmentById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
};

const updateAppointment = async (ctx) => {
  ctx.body = await appointmentService.updateById(ctx.params.id, {
    ...ctx.request.body,
    date: new Date(ctx.request.body.date),
    numberOfBeds: ctx.request.body.numberOfBeds,
    condition: ctx.request.body.condition,
    description: ctx.request.body.description,
    patientId: ctx.request.body.patientId,
    doctorId: ctx.request.body.doctorId,
    // patientId: ctx.state.session.patientId,
    // doctorId: ctx.state.session.doctorId,
  });
};

updateAppointment.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
  body: Joi.object({
    description: Joi.string(),
    numberOfBeds: Joi.number().integer().positive(),
    condition: Joi.string(),
    date: Joi.date().iso(),
    patientId: Joi.number().integer().positive(),
    doctorId: Joi.number().integer().positive(),
  }),
};

const deleteAppointment = async (ctx) => {
  await appointmentService.deleteById(
    ctx.params.id,
    ctx.state.session.patientId,
    ctx.state.session.doctorId
  );
  ctx.status = 204;
};

deleteAppointment.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
};

module.exports = function installAppointmentsRoutes(app) {
  const router = new Router({
    prefix: "/appointments",
  });

  router.use(requireAuthentication);

  // Routes with authentication/authorization
  router.get(
    "/",
    validate(getAllAppointments.validationScheme),
    checkAppointmentId,
    getAllAppointments
  );
  router.get(
    "/:id",
    validate(getAppointmentById.validationScheme),
    checkAppointmentId,
    getAppointmentById
  );
  router.post(
    "/",
    validate(createAppointment.validationScheme),
    checkAppointmentId,
    createAppointment
  );
  router.put(
    "/:id",
    validate(updateAppointment.validationScheme),
    checkAppointmentId,
    updateAppointment
  );
  router.delete(
    "/:id",
    validate(deleteAppointment.validationScheme),
    checkAppointmentId,
    deleteAppointment
  );

  app.use(router.routes()).use(router.allowedMethods());
};
