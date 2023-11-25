const supertest = require("supertest");
const createServer = require("../../src/createServer");
const { getKnex, tables } = require("../../src/data");

const data = {
  appointments: [
    {
      id: 1,
      patient_id: 1,
      doctor_id: 1,
      date: new Date(2023, 11, 15, 8, 15),
      description: "Annual Health Checkup",
      numberOfBeds: 3,
      condition: "Chest pain and shortness of breath",
    },
    {
      id: 2,
      patient_id: 1,
      doctor_id: 1,
      date: new Date(2023, 10, 25, 15, 15),
      description: "Dental Cleaning",
      numberOfBeds: 2,
      condition: "Toothache and cavity",
    },
    {
      id: 3,
      patient_id: 1,
      doctor_id: 1,
      date: new Date(2023, 9, 30, 12, 45),
      description: "Orthopedic Consultation",
      numberOfBeds: 1,
      condition: "Knee pain and difficulty walking",
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
      birthdate: new Date(2001, 10, 15),
    },
  ],
  doctors: [
    {
      id: 1,
      name: "Dr. Olivia Williams Anderson",
      speciality: "Cardiologist",
      numberOfPatients: 3, //this week
      photo: "../src/assets/imgs/doc1.jpg",
    },
  ],
};

const dataToDelete = {
  appointments: [1, 2, 3],
  patients: [1],
  doctors: [1],
};

describe("Appointments", () => {
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

  const url = "/api/appointments";

  describe("GET /api/appointments", () => {
    beforeAll(async () => {
      await knex(tables.patient).insert(data.patients);
      await knex(tables.doctor).insert(data.doctors);
      await knex(tables.appointment).insert(data.appointments);
    });

    afterAll(async () => {
      await knex(tables.appointment)
        .whereIn("id", dataToDelete.appointments)
        .delete();

      await knex(tables.patient).whereIn("id", dataToDelete.patients).delete();

      await knex(tables.doctor).whereIn("id", dataToDelete.doctors).delete();
    });

    it("should 200 and return all appointments", async () => {
      const response = await request.get(url);
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(3);

      expect(response.body.items[1]).toEqual({
        id: 2,
        doctor: {
          id: 1,
          name: "Dr. Olivia Williams Anderson",
        },
        patient: {
          id: 1,
          name: "Emily Smith",
        },
        date: new Date(2023, 10, 25, 15, 15).toJSON(),
        description: "Dental Cleaning",
        numberOfBeds: 2,
        condition: "Toothache and cavity",
      });
      expect(response.body.items[2]).toEqual({
        id: 1,
        doctor: {
          id: 1,
          name: "Dr. Olivia Williams Anderson",
        },
        patient: {
          id: 1,
          name: "Emily Smith",
        },
        date: new Date(2023, 11, 15, 8, 15).toJSON(),
        description: "Annual Health Checkup",
        numberOfBeds: 3,
        condition: "Chest pain and shortness of breath",
      });
    });
    it("should 400 when given an argument", async () => {
      const response = await request.get(`${url}?invalid=true`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.query).toHaveProperty("invalid");
    });
  });

  describe("GET /api/appointments/:id", () => {
    beforeAll(async () => {
      // testdata laden in de db
      await knex(tables.patient).insert(data.patients);
      await knex(tables.doctor).insert(data.doctors);
      await knex(tables.appointment).insert(data.appointments[0]);
    });

    afterAll(async () => {
      // testdata verwijderen
      await knex(tables.appointment)
        .whereIn("id", dataToDelete.appointments)
        .delete();

      await knex(tables.patient).whereIn("id", dataToDelete.patients).delete();

      await knex(tables.doctor).whereIn("id", dataToDelete.doctors).delete();
    });

    test("it should 200 and return the requested appointment", async () => {
      const response = await request.get(`${url}/1`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        doctor: {
          id: 1,
          name: "Dr. Olivia Williams Anderson",
        },
        patient: {
          id: 1,
          name: "Emily Smith",
        },
        date: new Date(2023, 11, 15, 8, 15).toJSON(),
        description: "Annual Health Checkup",
        numberOfBeds: 3,
        condition: "Chest pain and shortness of breath",
      });
    });
    it("should 404 when requesting not existing appointment", async () => {
      const response = await request.get(`${url}/2`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: "NOT_FOUND",
        message: "No appointment with id 2 exists",
        details: {
          id: 2,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it("should 400 with invalid appointment id", async () => {
      const response = await request.get(`${url}/invalid`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.params).toHaveProperty("id");
    });
  });

  describe("POST /api/appointments", () => {
    const appointmentsToDelete = [];

    beforeAll(async () => {
      await knex(tables.patient).insert(data.patients);
      await knex(tables.doctor).insert(data.doctors);
    });

    afterAll(async () => {
      await knex(tables.appointment)
        .whereIn("id", appointmentsToDelete)
        .delete();

      await knex(tables.patient).whereIn("id", dataToDelete.patients).delete();
      await knex(tables.doctor).whereIn("id", dataToDelete.doctors).delete();
    });

    it("should 201 and return the created appointment", async () => {
      const response = await request.post(url).send({
        description: "New Appointment",
        numberOfBeds: 2,
        condition: "General Checkup",
        date: "2023-10-10T14:00:00.000Z",
        patientId: 1,
        doctorId: 1,
      });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.description).toBe("New Appointment");
      expect(response.body.numberOfBeds).toBe(2);
      expect(response.body.condition).toBe("General Checkup");
      expect(response.body.date).toBe("2023-10-10T14:00:00.000Z");
      expect(response.body.patient).toEqual({
        id: 1,
        name: "Emily Smith",
      });
      expect(response.body.doctor).toEqual({
        id: 1,
        name: "Dr. Olivia Williams Anderson",
      });

      appointmentsToDelete.push(response.body.id);
    });

    it("should 404 when patient does not exist", async () => {
      const response = await request.post(url).send({
        description: "New Appointment",
        numberOfBeds: 2,
        condition: "General Checkup",
        date: "2023-10-10T14:00:00.000Z",
        patientId: 123,
        doctorId: 1,
      });

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: "NOT_FOUND",
        message: "No patient with id 123 exists",
        details: {
          id: 123,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it("should 400 when missing description", async () => {
      const response = await request.post(url).send({
        numberOfBeds: 2,
        condition: "General Checkup",
        date: "2023-10-10T14:00:00.000Z",
        patientId: 1,
        doctorId: 1,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("description");
    });

    it("should 400 when missing numberOfBeds", async () => {
      const response = await request.post(url).send({
        description: "New Appointment",
        condition: "General Checkup",
        date: "2023-10-10T14:00:00.000Z",
        patientId: 1,
        doctorId: 1,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("numberOfBeds");
    });

    it("should 400 when missing condition", async () => {
      const response = await request.post(url).send({
        description: "New Appointment",
        numberOfBeds: 2,
        date: "2023-10-10T14:00:00.000Z",
        patientId: 1,
        doctorId: 1,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("condition");
    });

    it("should 400 when missing date", async () => {
      const response = await request.post(url).send({
        description: "New Appointment",
        numberOfBeds: 2,
        condition: "General Checkup",
        patientId: 1,
        doctorId: 1,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("date");
    });

    it("should 400 when missing patientId", async () => {
      const response = await request.post(url).send({
        description: "New Appointment",
        numberOfBeds: 2,
        condition: "General Checkup",
        date: "2023-10-10T14:00:00.000Z",
        doctorId: 1,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("patientId");
    });
  });

  describe("PUT /api/appointments/:id", () => {
    beforeAll(async () => {
      await knex(tables.patient).insert(data.patients);
      await knex(tables.doctor).insert(data.doctors);
      await knex(tables.appointment).insert(data.appointments[0]);
    });

    afterAll(async () => {
      await knex(tables.appointment)
        .whereIn("id", dataToDelete.appointments)
        .delete();

      await knex(tables.patient).whereIn("id", dataToDelete.patients).delete();

      await knex(tables.doctor).whereIn("id", dataToDelete.doctors).delete();
    });

    it("should 200 and return the updated appointment", async () => {
      const response = await request.put(`${url}/1`).send({
        description: "Updated Appointment",
        numberOfBeds: 4,
        condition: "Updated Condition",
        date: "2023-10-10T15:30:00.000Z",
        patientId: 1,
        doctorId: 1,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBeTruthy();
      expect(response.body.description).toBe("Updated Appointment");
      expect(response.body.numberOfBeds).toBe(4);
      expect(response.body.condition).toBe("Updated Condition");
      expect(response.body.date).toBe("2023-10-10T15:30:00.000Z");
      expect(response.body.patient).toEqual({
        name: "Emily Smith",
        id: 1,
      });
      expect(response.body.doctor).toEqual({
        name: "Dr. Olivia Williams Anderson",
        id: 1,
      });
    });

    it("should 400 when updating not existing appointment", async () => {
      const response = await request.put(`${url}/2`).send({
        description: "Updated Appointment",
        numberOfBeds: 4,
        condition: "Updated Condition",
        date: "2023-10-10T15:30:00.000Z",
        patientId: 1,
        doctorId: 1,
      });

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: "NOT_FOUND",
        message: "No appointment with id 2 exists",
        details: {
          id: 2,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it("should 404 when patient does not exist", async () => {
      const response = await request.put(`${url}/1`).send({
        description: "Updated Appointment",
        numberOfBeds: 4,
        condition: "Updated Condition",
        date: "2023-10-10T15:30:00.000Z",
        patientId: 123,
        doctorId: 1,
      });

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: "NOT_FOUND",
        message: "No patient with id 123 exists",
        details: {
          id: 123,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it("should 400 when missing condition", async () => {
      const response = await request.put(`${url}/4`).send({
        description: "Updated Appointment",
        numberOfBeds: 4,
        date: "2023-10-10T15:30:00.000Z",
        patientId: 1,
        doctorId: 1,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("condition");
    });

    it("should 400 when missing date", async () => {
      const response = await request.put(`${url}/4`).send({
        condition: "Updated Condition",
        numberOfBeds: 4,
        description: "Updated Appointment",
        patientId: 1,
        doctorId: 1,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("date");
    });

    it("should 400 when missing patientId", async () => {
      const response = await request.put(`${url}/4`).send({
        condition: "Updated Condition",
        numberOfBeds: 4,
        date: "2021-05-27T13:00:00.000Z",
        description: "Updated Appointment",
        doctorId: 1,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("patientId");
    });

    it("should 400 when missing doctorId", async () => {
      const response = await request.put(`${url}/4`).send({
        condition: "Updated Condition",
        numberOfBeds: 4,
        date: "2021-05-27T13:00:00.000Z",
        description: "Updated Appointment",
        patientId: 1,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("doctorId");
    });
  });

  describe("DELETE /api/appointments/:id", () => {
    beforeAll(async () => {
      await knex(tables.patient).insert(data.patients);
      await knex(tables.doctor).insert(data.doctors);
      await knex(tables.appointment).insert(data.appointments[0]);
    });

    afterAll(async () => {
      await knex(tables.patient).whereIn("id", dataToDelete.patients).delete();
      await knex(tables.doctor).whereIn("id", dataToDelete.doctors).delete();
    });

    it("should 204 and return nothing", async () => {
      const response = await request.delete(`${url}/1`);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it("should 404 with not existing patient", async () => {
      const response = await request.delete(`${url}/4`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: "NOT_FOUND",
        message: "No appointment with id 4 exists",
        details: {
          id: 4,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it("should 400 with invalid appointment id", async () => {
      const response = await request.delete(`${url}/invalid`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.params).toHaveProperty("id");
    });
  });
});
