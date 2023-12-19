const { tables } = require("../../src/data");
const Role = require("../../src/core/roles");
const { withServer, loginPatient, loginAdmin } = require("../supertest.setup");
const { testAuthHeader } = require("../common/auth");

const data = {
  users: [
    {
      id: 1,
      email: "emily.smith@gmail.com",
      password_hash: "doesntmatter",
      roles: JSON.stringify([Role.PATIENT]),
    },
    {
      id: 2,
      email: "david.brown@gmail.com",
      password_hash: "doesntmatter",
      roles: JSON.stringify([Role.PATIENT]),
    },
    {
      id: 3,
      email: "sophia.davis@gmail.com",
      password_hash: "doesntmatter",
      roles: JSON.stringify([Role.PATIENT]),
    },
  ],
  patients: [
    {
      id: 1,
      name: "Emily Smith",
      street: "789 Oak Street",
      number: "Apt 3C",
      postalCode: "54321",
      city: "Metropolitan City",
      birthdate: new Date(2001, 1, 1),
    },
    {
      id: 2,
      name: "David Brown",
      street: "456 Elm Avenue",
      number: "Suite 5D",
      postalCode: "12345",
      city: "Urbanville",
      birthdate: new Date(2002, 2, 2),
    },
    {
      id: 3,
      name: "Sophia Davis",
      street: "101 Pine Road",
      number: "Unit 7B",
      postalCode: "67890",
      city: "Cityscape",
      birthdate: new Date(2003, 3, 3),
    },
  ],
};

const dataToDelete = {
  patients: [1, 2, 3],
  users: [1, 2, 3],
};

describe("Patients", () => {
  let request, knex, authHeader, adminAuthHeader;

  withServer(({ supertest, knex: k }) => {
    request = supertest;
    knex = k;
  });

  beforeAll(async () => {
    authHeader = await loginPatient(request);
    adminAuthHeader = await loginAdmin(request);
  });

  const url = "/api/patients";

  describe("GET /api/patients", () => {
    beforeAll(async () => {
      // Check if the user already exists
      for (const user of data.users) {
        const userExists = await knex(tables.user).where("id", user.id).first();

        // Only insert the user if it doesn't already exist
        if (!userExists) {
          await knex(tables.user).insert(user);
        }
      }

      // Check if the patient already exists
      for (const patient of data.patients) {
        const patientExists = await knex(tables.patient)
          .where("id", patient.id)
          .first();

        // Only insert the patient if it doesn't already exist
        if (!patientExists) {
          await knex(tables.patient).insert(patient);
        }
      }
    });

    afterAll(async () => {
      await knex(tables.patient).whereIn("id", dataToDelete.patients).delete();
      // await knex(tables.user).whereIn("id", dataToDelete.users).delete();
    });

    it("should 200 and return all patients", async () => {
      const response = await request
        .get(url)
        .set("Authorization", adminAuthHeader);
    
      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBeGreaterThanOrEqual(3);
    
      expect(response.body.items[0]).toEqual({
        id: 2,
        name: "David Brown",
        email: "david.brown@gmail.com",
        roles: [Role.PATIENT],
        street: "456 Elm Avenue",
        number: "Suite 5D",
        postalCode: "12345",
        city: "Urbanville",
        birthdate: expect.any(String),
      });
    
      expect(response.body.items[2]).toEqual({
        id: 3,
        name: "Sophia Davis",
        email: "sophia.davis@gmail.com",
        roles: [Role.PATIENT],
        street: "101 Pine Road",
        number: "Unit 7B",
        postalCode: "67890",
        city: "Cityscape",
        birthdate: expect.any(String),
      });
    });

    it("should 400 when given an argument", async () => {
      const response = await request
        .get(`${url}?invalid=true`)
        .set("Authorization", adminAuthHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.query).toHaveProperty("invalid");
    });
    testAuthHeader(() => request.get(url));
  });

  describe("GET /api/patients/:id", () => {
    beforeEach(async () => {
      // Check if the user already exists
      for (const user of data.users) {
        const userExists = await knex(tables.user).where("id", user.id).first();

        // Only insert the user if it doesn't already exist
        if (!userExists) {
          await knex(tables.user).insert(user);
        }
      }

      // Check if the patient already exists
      for (const patient of data.patients) {
        const patientExists = await knex(tables.patient)
          .where("id", patient.id)
          .first();

        // Only insert the patient if it doesn't already exist
        if (!patientExists) {
          await knex(tables.patient).insert(patient);
        }
      }
    });

    afterEach(async () => {
      await knex(tables.patient).whereIn("id", dataToDelete.patients).delete();
      // await knex(tables.user).whereIn("id", dataToDelete.users).delete();
    });

    it("should 200 and return the requested patient", async () => {
      const response = await request
        .get(`${url}/1`)
        .set("Authorization", authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        email: "emily.smith@gmail.com",
        roles: [Role.PATIENT],
        name: "Emily Smith",
        street: "789 Oak Street",
        number: "Apt 3C",
        postalCode: "54321",
        city: "Metropolitan City",
        birthdate: new Date(2001, 1, 1).toJSON(),
      });
    });
    it("should 404 when requesting not existing patient", async () => {
      const response = await request
        .get(`${url}/200`)
        .set("Authorization", authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: "NOT_FOUND",
        message: "No patient with id 200 exists",
        details: {
          id: 200,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it("should 400 with invalid patient id", async () => {
      const response = await request
        .get(`${url}/invalid`)
        .set("Authorization", authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.params).toHaveProperty("id");
    });
    testAuthHeader(() => request.get(`${url}/1`));
  });

  describe("POST /api/patients/register", () => {
    const patientsToDelete = [];

    afterAll(async () => {
      await knex(tables.patient).whereIn("id", patientsToDelete).delete();
      // await knex(tables.user).whereIn("id", dataToDelete.users).delete();
    });

    it("should 200 and return the registered patient", async () => {
      const response = await request.post(`${url}/register`).send({
        name: "New patient",
        email: "new@patient.be",
        password: "12345678",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user.name).toBe("New patient");
      expect(response.body.user.email).toBe("new@patient.be");
      expect(response.body.user.passwordHash).toBeUndefined();
      expect(response.body.user.street).toBe("Default Street");
      expect(response.body.user.number).toBe("Default Number");
      expect(response.body.user.postalCode).toBe("Default postalcode");
      expect(response.body.user.city).toBe("Default City");
      expect(response.body.user.roles).toEqual([Role.PATIENT]);
      expect(response.body.user.birthdate).toBeTruthy();
    });

    it("should 400 when missing name", async () => {
      const response = await request.post(`${url}/register`).send({
        email: "register@hogent.be",
        password: "12345678",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("name");
    });
  });

  describe("PUT /api/patients/:id", () => {
    beforeEach(async () => {
      // Check if the user already exists
      for (const user of data.users) {
        const userExists = await knex(tables.user).where("id", user.id).first();

        // Only insert the user if it doesn't already exist
        if (!userExists) {
          await knex(tables.user).insert(user);
        }
      }

      // Check if the patient already exists
      for (const patient of data.patients) {
        const patientExists = await knex(tables.patient)
          .where("id", patient.id)
          .first();

        // Only insert the patient if it doesn't already exist
        if (!patientExists) {
          await knex(tables.patient).insert(patient);
        }
      }
    });

    afterEach(async () => {
      await knex(tables.patient).whereIn("id", dataToDelete.patients).delete();
      // await knex(tables.user).whereIn("id", dataToDelete.users).delete();
    });

    it("should 200 and return the updated patient", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .send({
          name: "Changed name",
          email: "changedEmail@gmail.com",
          street: "789 Oak Street",
          number: "Apt 3C",
          postalCode: "54321",
          city: "Metropolitan City",
          birthdate: new Date(2001, 10, 15),
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: "Changed name",
        email: "changedEmail@gmail.com",
        roles: ["PATIENT"],
        street: "789 Oak Street",
        number: "Apt 3C",
        postalCode: "54321",
        city: "Metropolitan City",
        birthdate: new Date(2001, 10, 15).toJSON(),
      });
    });

    it("should 404 with not existing patient", async () => {
      const response = await request
        .delete(`${url}/111`)
        .set("Authorization", adminAuthHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: "NOT_FOUND",
        message: "No patient with id 111 exists",
        details: {
          id: 111,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it("should 400 when missing name", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .send({
          email: "changedEmail@gmail.com",
          street: "789 Oak Street",
          number: "Apt 3C",
          postalCode: "54321",
          city: "Metropolitan City",
          birthdate: new Date(2001, 10, 15).toJSON(),
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("name");
    });

    it("should 400 when missing email", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .send({
          name: "The name",
          street: "789 Oak Street",
          number: "Apt 3C",
          postalCode: "54321",
          city: "Metropolitan City",
          birthdate: new Date(2001, 10, 15).toJSON(),
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("email");
    });

    it("should 400 when missing street", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .send({
          name: "The name",
          email: "changedEmail@gmail.com",
          number: "Apt 3C",
          postalCode: "54321",
          city: "Metropolitan City",
          birthdate: new Date(2001, 10, 15).toJSON(),
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("street");
    });

    it("should 400 when missing number", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .send({
          name: "The name",
          email: "changedEmail@gmail.com",

          street: "789 Oak Street",
          postalCode: "54321",
          city: "Metropolitan City",
          birthdate: new Date(2001, 10, 15).toJSON(),
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("number");
    });

    it("should 400 when missing postalCode", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .send({
          name: "The name",
          email: "changedEmail@gmail.com",

          street: "789 Oak Street",
          number: "Apt 3C",
          city: "Metropolitan City",
          birthdate: new Date(2001, 10, 15).toJSON(),
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("postalCode");
    });

    it("should 400 when missing city", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .send({
          name: "The name",
          email: "changedEmail@gmail.com",

          street: "789 Oak Street",
          number: "Apt 3C",
          postalCode: "54321",
          birthdate: new Date(2001, 10, 15).toJSON(),
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("city");
    });

    it("should 400 when missing birthdate", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .send({
          name: "The name",
          email: "changedEmail@gmail.com",

          street: "789 Oak Street",
          number: "Apt 3C",
          postalCode: "54321",
          city: "Metropolitan City",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("birthdate");
    });
    testAuthHeader(() => request.put(`${url}/1`));
  });

  describe("DELETE /api/patients/:id", () => {
    beforeEach(async () => {
      // Check if the user already exists
      for (const user of data.users) {
        const userExists = await knex(tables.user).where("id", user.id).first();

        // Only insert the user if it doesn't already exist
        if (!userExists) {
          await knex(tables.user).insert(user);
        }
      }

      // Check if the patient already exists
      for (const patient of data.patients) {
        const patientExists = await knex(tables.patient)
          .where("id", patient.id)
          .first();

        // Only insert the patient if it doesn't already exist
        if (!patientExists) {
          await knex(tables.patient).insert(patient);
        }
      }
    });

    afterEach(async () => {
      await knex(tables.patient).whereIn("id", dataToDelete.patients).delete();
      // await knex(tables.user).whereIn("id", dataToDelete.users).delete();
    });

    it("should 204 and return nothing", async () => {
      const response = await request
        .delete(`${url}/1`)
        .set("Authorization", adminAuthHeader);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });
    it("should 404 with not existing patient", async () => {
      const response = await request
        .delete(`${url}/111`)
        .set("Authorization", adminAuthHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: "NOT_FOUND",
        message: "No patient with id 111 exists",
        details: {
          id: 111,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it("should 400 with invalid patient id", async () => {
      const response = await request
        .get(`${url}/invalid`)
        .set("Authorization", adminAuthHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.params).toHaveProperty("id");
    });
    testAuthHeader(() => request.delete(`${url}/1`));
  });
});
