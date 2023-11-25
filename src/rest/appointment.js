const Router = require("@koa/router");
const appointmentService = require("../service/appointment");
const Joi = require("joi");
const validate = require("../core/validation");

const getAllAppointments = async (ctx) => {
  ctx.body = await appointmentService.getAll();
};

getAllAppointments.validationScheme = null;

const createAppointment = async (ctx) => {
  const patientId = Number(ctx.request.body.patient.id);
  const doctorId = Number(ctx.request.body.doctor.id);

  const newAppointment = await appointmentService.create({
    ...ctx.request.body,
    date: new Date(ctx.request.body.date),
    numberOfBeds: Number(ctx.request.body.numberOfBeds),
    patientId: patientId,
    doctorId: doctorId,
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
    patient: Joi.object({
      id: Joi.number().integer().positive(),
    }),
    doctor: Joi.object({
      id: Joi.number().integer().positive(),
    }),
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
    patientId: Number(ctx.request.body.patient.id),
    doctorId: Number(ctx.request.body.doctor.id),
  });
};

updateAppointment.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
  body: Joi.object({
    description: Joi.string(),
    numberOfBeds: Joi.number().integer().positive(),
    condition: Joi.string(),
    date: Joi.date().iso(),
    patient: Joi.object({
      id: Joi.number().integer().positive(),
    }),
    doctor: Joi.object({
      id: Joi.number().integer().positive(),
    }),
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
