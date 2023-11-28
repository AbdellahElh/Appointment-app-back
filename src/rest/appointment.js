const Router = require("@koa/router");
const Joi = require("joi");
const validate = require("../core/validation");
const { requireAuthentication } = require('../core/auth');
const appointmentService = require("../service/appointment");

const getAllAppointments = async (ctx) => {
  ctx.body = await appointmentService.getAll();
};

getAllAppointments.validationScheme = null;

const createAppointment = async (ctx) => {
  const newAppointment = await appointmentService.create({
    ...ctx.request.body,
    date: new Date(ctx.request.body.date),
    numberOfBeds: Number(ctx.request.body.numberOfBeds),
    patientId: Number(ctx.request.body.patientId),
    doctorId: Number(ctx.request.body.doctorId),
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

const getAppointmentsById = async (ctx) => {
  ctx.body = await appointmentService.getById(Number(ctx.params.id));
};

getAppointmentsById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
};

const updateAppointment = async (ctx) => {
  ctx.body = await appointmentService.updateById(Number(ctx.params.id), {
    ...ctx.request.body,
    date: new Date(ctx.request.body.date),
    numberOfBeds: Number(ctx.request.body.numberOfBeds),
    patientId: Number(ctx.request.body.patientId),
    doctorId: Number(ctx.request.body.doctorId),
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
  await appointmentService.deleteById(Number(ctx.params.id));
  ctx.status = 204;
};

deleteAppointment.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
};

module.exports = (app) => {
  const router = new Router({
    prefix: "/appointments",
  });

  router.use(requireAuthentication);

  router.get(
    "/",
    validate(getAllAppointments.validationScheme),
    getAllAppointments
  );
  router.post(
    "/",
    validate(createAppointment.validationScheme),
    createAppointment
  );
  router.get(
    "/:id",
    validate(getAppointmentsById.validationScheme),
    getAppointmentsById
  );
  router.put(
    "/:id",
    validate(updateAppointment.validationScheme),
    updateAppointment
  );
  router.delete(
    "/:id",
    validate(deleteAppointment.validationScheme),
    deleteAppointment
  );

  app.use(router.routes()).use(router.allowedMethods());
};
