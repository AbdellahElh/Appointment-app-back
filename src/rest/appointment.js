const Router = require("@koa/router");
const appointmentService = require("../service/appointment");

const getAllAppointments = async (ctx) => {
  ctx.body = await appointmentService.getAll();
};

// const createAppointment = async (ctx) => {
//   const newAppointment = await appointmentService.create({
//     ...ctx.request.body,
//     date: new Date(ctx.request.body.date),
//     numberOfBeds: Number(ctx.request.body.numberOfBeds),
//     patientId: Number(ctx.request.body.patientId),
//     doctorId: Number(ctx.request.body.doctorId),
//   });
//   ctx.status = 201;
//   ctx.body = newAppointment;
// };

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



const getAppointmentsById = async (ctx) => {
  ctx.body = await appointmentService.getById(Number(ctx.params.id));
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

const deleteAppointment = async (ctx) => {
  await appointmentService.deleteById(Number(ctx.params.id));
  ctx.status = 204;
};

module.exports = (app) => {
  const router = new Router({
    prefix: "/appointments",
  });

  router.get("/", getAllAppointments);
  router.post("/", createAppointment);
  router.get("/:id", getAppointmentsById);
  router.put("/:id", updateAppointment);
  router.delete("/:id", deleteAppointment);

  app.use(router.routes()).use(router.allowedMethods());
};
