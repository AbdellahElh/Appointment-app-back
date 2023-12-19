const supertest = require("supertest");
const createServer = require("../src/createServer");
const { getKnex } = require("../src/data");

const loginPatient = async (supertest) => {
  const response = await supertest.post("/api/patients/login").send({
    email: "emily.smith@gmail.com",
    password: "12345678",
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body.message || "Unknown error occured");
  }

  return `Bearer ${response.body.token}`;
};

const loginDoctor = async (supertest) => {
  const response = await supertest.post("/api/doctors/login").send({
    email: "olivia.anderson@gmail.com",
    password: "12345678",
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body.message || "Unknown error occured");
  }

  return `Bearer ${response.body.token}`;
};

const loginAdmin = async (supertest) => {
  const response = await supertest.post("/api/doctors/login").send({
    email: "abdellah.elhalimimerroun@student.hogent.be",
    password: "12345678",
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body.message || "Unknown error occured");
  }

  return `Bearer ${response.body.token}`;
};

const withServer = (setter) => {
  let server;

  beforeAll(async () => {
    server = await createServer();

    setter({
      knex: getKnex(),
      supertest: supertest(server.getApp().callback()),
    });
  });

  afterAll(async () => {
    await server.stop();
  });
};

module.exports = {
  loginPatient,
  loginDoctor,
  loginAdmin,
  withServer,
};
