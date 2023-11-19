const Router = require('@koa/router');
const patientService = require('../service/patient');

const getAllPatients = async (ctx) => {
  ctx.body = await patientService.getAll();
};

const createPatient = async (ctx) => {
  const newPatient = await patientService.create({
    ...ctx.request.body,
    id: Number(ctx.request.body.id),
    name: ctx.request.body.name,
    street: ctx.request.body.street,
    number: ctx.request.body.number,
    postalCode: ctx.request.body.postalCode,
    city: ctx.request.body.city,
    birthdate: new Date(ctx.request.body.birthdate),
  });
  ctx.status = 201;
  ctx.body = newPatient;
};

const getPatientById = async (ctx) => {
  ctx.body = await patientService.getById(Number(ctx.params.id));
};

const updatePatient = async (ctx) => {
  ctx.body = await patientService.updateById(Number(ctx.params.id), {
    ...ctx.request.body,
    id: Number(ctx.request.body.id),
    name: ctx.request.body.name,
    street: ctx.request.body.street,
    number: ctx.request.body.number,
    postalCode: ctx.request.body.postalCode,
    city: ctx.request.body.city,
    birthdate: new Date(ctx.request.body.birthdate),
  });
};

const deletePatient = async (ctx) => {
  await patientService.deleteById(ctx.params.id);
  ctx.status = 204;
};

module.exports = (app) => {
  const router = new Router({
    prefix: '/patients',
  });

  router.get('/', getAllPatients);
  router.post('/', createPatient);
  router.get('/:id', getPatientById);
  router.put('/:id', updatePatient);
  router.delete('/:id', deletePatient);

  app.use(router.routes()).use(router.allowedMethods());
};
