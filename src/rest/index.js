const Router = require("@koa/router");

const installAppointmentRouter = require("./appointment");
const installHealthRouter = require("./health");
const installPatientRouter = require("./patient");
const installDoctorRouter = require("./doctor");


module.exports = (app) => {
  const router = new Router({
    prefix: "/api",
  });

  installAppointmentRouter(router);
  installHealthRouter(router);
  installPatientRouter(router);
  installDoctorRouter(router);

  app.use(router.routes()).use(router.allowedMethods());
};
