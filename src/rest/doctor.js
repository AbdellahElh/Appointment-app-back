const Router = require("@koa/router");
const doctorService = require("../service/doctor");
const Joi = require("joi");
const validate = require("../core/validation");

const getAllDoctors = async (ctx) => {
  ctx.body = await doctorService.getAll();
};
getAllDoctors.validationScheme = null;

const createDoctor = async (ctx) => {
  const newDoctor = await doctorService.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = newDoctor;
};
createDoctor.validationScheme = {
  body: Joi.object({
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

const getDoctorsById = async (ctx) => {
  ctx.body = await doctorService.getById(Number(ctx.params.id));
};
getDoctorsById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

const updateDoctor = async (ctx) => {
  ctx.body = await doctorService.updateById(
    Number(ctx.params.id),
    ctx.request.body
  );
};
updateDoctor.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
  body: Joi.object({
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

const deleteDoctor = async (ctx) => {
  await doctorService.deleteById(Number(ctx.params.id));
  ctx.status = 204;
};
deleteDoctor.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

module.exports = (app) => {
  const router = new Router({
    prefix: "/doctors",
  });

  router.get("/", validate(getAllDoctors.validationScheme), getAllDoctors);
  router.post("/", validate(createDoctor.validationScheme), createDoctor);
  router.get("/:id", validate(getDoctorsById.validationScheme), getDoctorsById);
  router.put("/:id", validate(updateDoctor.validationScheme), updateDoctor);
  router.delete("/:id", validate(deleteDoctor.validationScheme), deleteDoctor);

  app.use(router.routes()).use(router.allowedMethods());
};
