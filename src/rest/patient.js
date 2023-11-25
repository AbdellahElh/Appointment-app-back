const Router = require("@koa/router");
const patientService = require("../service/patient");
const Joi = require("joi");
const validate = require("../core/validation");

const getAllPatients = async (ctx) => {
  ctx.body = await patientService.getAll();
};
getAllPatients.validationScheme = null;

const createPatient = async (ctx) => {
  const newPatient = await patientService.create({
    ...ctx.request.body,
    birthdate: new Date(ctx.request.body.birthdate),
  });
  ctx.status = 201;
  ctx.body = newPatient;
};

createPatient.validationScheme = {
  body: Joi.object({
    name: Joi.string(),
    street: Joi.string(),
    number: Joi.string(),
    postalCode: Joi.string(),
    city: Joi.string(),
    birthdate: Joi.date().iso(),
  }),
};

const getPatientById = async (ctx) => {
  ctx.body = await patientService.getById(Number(ctx.params.id));
};

getPatientById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
};

const updatePatient = async (ctx) => {
  ctx.body = await patientService.updateById(Number(ctx.params.id), {
    ...ctx.request.body,
    birthdate: new Date(ctx.request.body.birthdate),
  });
};

updatePatient.validationScheme = {
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

const deletePatient = async (ctx) => {
  await patientService.deleteById(ctx.params.id);
  ctx.status = 204;
};

deletePatient.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
};

module.exports = (app) => {
  const router = new Router({
    prefix: "/patients",
  });

  router.get("/", validate(getAllPatients.validationScheme), getAllPatients);
  router.post("/", validate(createPatient.validationScheme), createPatient);
  router.get("/:id", validate(getPatientById.validationScheme), getPatientById);
  router.put("/:id", validate(updatePatient.validationScheme), updatePatient);
  router.delete(
    "/:id",
    validate(deletePatient.validationScheme),
    deletePatient
  );

  app.use(router.routes()).use(router.allowedMethods());
};
