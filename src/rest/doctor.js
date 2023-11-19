// const Router = require("@koa/router");
// const doctorService = require("../service/doctor");

// const getAllDoctors = async (ctx) => {
//   ctx.body = await doctorService.getAll();
// };

// const createDoctor = async (ctx) => {
//   const newDoctor = await doctorService.create({
//     ...ctx.request.body,
//     id: Number(ctx.request.body.id),
//     doctor: ctx.request.body.doctor,
//     speciality: ctx.request.body.speciality,
//     numberOfPatients: Number(ctx.request.body.numberOfPatients),
//     photo: ctx.request.body.photo,
//   });
//   ctx.status = 201;
//   ctx.body = newDoctor;
// };

// const getDoctorsById = async (ctx) => {
//   ctx.body = await doctorService.getById(Number(ctx.params.id));
// };

// const updateDoctor = async (ctx) => {
//   ctx.body = await doctorService.updateById(Number(ctx.params.id), {
//     ...ctx.request.body,
//     id: Number(ctx.request.body.id),
//     doctor: ctx.request.body.doctor,
//     speciality: ctx.request.body.speciality,
//     numberOfPatients: Number(ctx.request.body.numberOfPatients),
//     photo: ctx.request.body.photo,
//   });
// };

// const deleteDoctor = async (ctx) => {
//   await doctorService.deleteById(Number(ctx.params.id));
//   ctx.status = 204;
// };

// module.exports = (app) => {
//   const router = new Router({
//     prefix: "/doctors",
//   });

//   router.get("/", getAllDoctors);
//   router.post("/", createDoctor);
//   router.get("/:id", getDoctorsById);
//   router.put("/:id", updateDoctor);
//   router.delete("/:id", deleteDoctor);

//   app.use(router.routes()).use(router.allowedMethods());
// };

const Router = require("@koa/router");
const doctorService = require("../service/doctor");

const getAllDoctors = async (ctx) => {
  ctx.body = await doctorService.getAll();
};

const createDoctor = async (ctx) => {
  const newDoctor = await doctorService.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = newDoctor;
};

const getDoctorsById = async (ctx) => {
  ctx.body = await doctorService.getById(Number(ctx.params.id));
};

const updateDoctor = async (ctx) => {
  ctx.body = await doctorService.updateById(Number(ctx.params.id), ctx.request.body);
};

const deleteDoctor = async (ctx) => {
  await doctorService.deleteById(Number(ctx.params.id));
  ctx.status = 204;
};

module.exports = (app) => {
  const router = new Router({
    prefix: "/doctors",
  });

  router.get("/", getAllDoctors);
  router.post("/", createDoctor);
  router.get("/:id", getDoctorsById);
  router.put("/:id", updateDoctor);
  router.delete("/:id", deleteDoctor);

  app.use(router.routes()).use(router.allowedMethods());
};

