const supertest = require("supertest");

const createServer = require("../../src/createServer");
const { getKnex, tables } = require("../../src/data");

const data = {
  patients: [
    {
      id: 1,
      name: "Emily Smith",
      street: "789 Oak Street",
      number: "Apt 3C",
      postalCode: "54321",
      city: "Metropolitan City",
      birthdate: new Date(2001, 10, 15),
    },
    {
      id: 2,
      name: "David Brown",
      street: "456 Elm Avenue",
      number: "Suite 5D",
      postalCode: "12345",
      city: "Urbanville",
      birthdate: new Date(2002, 1, 2),
    },
    {
      id: 3,
      name: "Sophia Davis",
      street: "101 Pine Road",
      number: "Unit 7B",
      postalCode: "67890",
      city: "Cityscape",
      birthdate: new Date(2003, 2, 3),
    },
  ],
};

const dataToDelete = {
  patients: [1, 2, 3],
};

describe("Patients", () => {
  let server;
  let request;
  let knex;

  beforeAll(async () => {
    server = await createServer();
    request = supertest(server.getApp().callback());
    knex = getKnex();
  });

  afterAll(async () => {
    await server.stop();
  });

  const url = "/api/patients";

  describe("GET /api/patients", () => {
    beforeAll(async () => {
      await knex(tables.patient).insert(data.patients);
    });

    afterAll(async () => {
      await knex(tables.patient).whereIn("id", dataToDelete.patients).delete();
    });

    it("should 200 and return all patients", async () => {
      const response = await request.get(url);

      expect(response.statusCode).toBe(200);
      expect(response.body.items.length).toBe(3);

      expect(response.body.items).toEqual(
        expect.arrayContaining([
          {
            id: 2,
            name: "David Brown",
            street: "456 Elm Avenue",
            number: "Suite 5D",
            postalCode: "12345",
            city: "Urbanville",
            birthdate: new Date(2002, 1, 2).toJSON(),
          },
          {
            id: 3,
            name: "Sophia Davis",
            street: "101 Pine Road",
            number: "Unit 7B",
            postalCode: "67890",
            city: "Cityscape",
            birthdate: new Date(2003, 2, 3).toJSON(),
          },
        ])
      );
    });
    it("should 400 when given an argument", async () => {
      const response = await request.get(`${url}?invalid=true`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.query).toHaveProperty("invalid");
    });
  });

  describe("GET /api/patients/:id", () => {
    beforeAll(async () => {
      await knex(tables.patient).insert(data.patients[0]);
    });

    afterAll(async () => {
      await knex(tables.patient).whereIn("id", dataToDelete.patients).delete();
    });

    it("should 200 and return the requested patient", async () => {
      const response = await request.get(`${url}/1`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: "Emily Smith",
        street: "789 Oak Street",
        number: "Apt 3C",
        postalCode: "54321",
        city: "Metropolitan City",
        birthdate: new Date(2001, 10, 15).toJSON(),
      });
    });
    it("should 404 when requesting not existing patient", async () => {
      const response = await request.get(`${url}/2`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: "NOT_FOUND",
        message: "No patient with id 2 exists",
        details: {
          id: 2,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it("should 400 with invalid patient id", async () => {
      const response = await request.get(`${url}/invalid`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.params).toHaveProperty("id");
    });
  });

  describe("POST /api/patients", () => {
    const patientsToDelete = [];

    afterAll(async () => {
      await knex(tables.patient).whereIn("id", patientsToDelete).delete();
    });

    it("should 201 and return the created patient", async () => {
      const response = await request.post(url).send({
        name: "New patient",
        street: "789 Oak Street",
        number: "Apt 3C",
        postalCode: "54321",
        city: "Metropolitan City",
        birthdate: new Date(2001, 10, 15),
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.name).toBe("New patient");
      expect(response.body.street).toBe("789 Oak Street");
      expect(response.body.number).toBe("Apt 3C");
      expect(response.body.postalCode).toBe("54321");
      expect(response.body.city).toBe("Metropolitan City");
      expect(response.body.birthdate).toBe("2001-11-14T23:00:00.000Z");

      patientsToDelete.push(response.body.id);
    });
    it("should 400 when missing name", async () => {
      const response = await request.post(url).send({
        street: "789 Oak Street",
        number: "Apt 3C",
        postalCode: "54321",
        city: "Metropolitan City",
        birthdate: new Date(2001, 10, 15),
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("name");
    });
  });

  describe("PUT /api/patients/:id", () => {
    beforeAll(async () => {
      await knex(tables.patient).insert(data.patients);
    });

    afterAll(async () => {
      await knex(tables.patient).whereIn("id", dataToDelete.patients).delete();
    });

    it("should 200 and return the updated patient", async () => {
      const response = await request.put(`${url}/1`).send({
        name: "Changed name",
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
        street: "789 Oak Street",
        number: "Apt 3C",
        postalCode: "54321",
        city: "Metropolitan City",
        birthdate: new Date(2001, 10, 15).toJSON(),
      });
    });

    it("should 400 when missing name", async () => {
      const response = await request.put(`${url}/1`).send({
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

    it("should 400 when missing street", async () => {
      const response = await request.put(`${url}/1`).send({
        name: "The name",
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
      const response = await request.put(`${url}/1`).send({
        name: "The name",
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
      const response = await request.put(`${url}/1`).send({
        name: "The name",
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
      const response = await request.put(`${url}/1`).send({
        name: "The name",
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
      const response = await request.put(`${url}/1`).send({
        name: "The name",
        street: "789 Oak Street",
        number: "Apt 3C",
        postalCode: "54321",
        city: "Metropolitan City",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("birthdate");
    });
  });

  describe("DELETE /api/patients/:id", () => {
    beforeAll(async () => {
      await knex(tables.patient).insert(data.patients[0]);
    });

    it("should 204 and return nothing", async () => {
      const response = await request.delete(`${url}/1`);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });
    it('should 404 with not existing patient', async () => {
      const response = await request.delete(`${url}/1`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: 'NOT_FOUND',
        message: 'No patient with id 1 exists',
        details: {
          id: 1,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it('should 400 with invalid patient id', async () => {
      const response = await request.get(`${url}/invalid`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });
  });
});
