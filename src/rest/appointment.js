const Router = require("@koa/router");
const Joi = require("joi");

const validate = require("../core/validation");
const { requireAuthentication } = require("../core/auth");
const Role = require("../core/roles");
const appointmentService = require("../service/appointment");

const getAllAppointments = async (ctx) => {
  const { userId, roles } = ctx.state.session;
  ctx.body = await appointmentService.getAll(userId, roles);
};

getAllAppointments.validationScheme = null;

const getAppointmentById = async (ctx) => {
  const { userId, roles } = ctx.state.session;
  ctx.body = await appointmentService.getById(ctx.params.id, userId, roles);
};

getAppointmentById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
};

const createAppointment = async (ctx) => {
  const { userId, roles } = ctx.state.session;
  const newAppointment = await appointmentService.create(
    {
      ...ctx.request.body,
    },
    roles,
    userId
  );

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

const updateAppointment = async (ctx) => {
  const { userId, roles } = ctx.state.session;
  const { id } = ctx.params;

  const updatedAppointment = await appointmentService.updateById(
    id,
    {
      ...ctx.request.body,
    },
    roles,
    userId
  );
  ctx.body = updatedAppointment;
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
  // Een nieuwe router wordt gecreëerd met de prefix "/appointments"
  const router = new Router({
    prefix: "/appointments",
  });

  // De router gebruikt de requireAuthentication middleware voor alle routes
  router.use(requireAuthentication);

  // Een GET route wordt gedefinieerd voor het ophalen van alle appointments
  // De validate middleware valideert de aanvraag voordat deze naar de handler wordt gestuurd
  router.get(
    "/",
    validate(getAllAppointments.validationScheme),
    getAllAppointments
  );

  // Een GET route wordt gedefinieerd voor het ophalen van een appointment op basis van ID
  router.get(
    "/:id",
    validate(getAppointmentById.validationScheme),
    getAppointmentById
  );

  // Een POST route wordt gedefinieerd voor het aanmaken van een nieuwe appointment
  router.post(
    "/",
    validate(createAppointment.validationScheme),
    createAppointment
  );

  // Een PUT route wordt gedefinieerd voor het bijwerken van een appointment op basis van ID
  router.put(
    "/:id",
    validate(updateAppointment.validationScheme),
    updateAppointment
  );

  // Een DELETE route wordt gedefinieerd voor het verwijderen van een appointment op basis van ID
  router.delete(
    "/:id",
    validate(deleteAppointment.validationScheme),
    deleteAppointment
  );

  // De router wordt toegevoegd aan de Koa-applicatie
  app.use(router.routes()).use(router.allowedMethods());
};
