const { tables } = require("../../src/data");
const { withServer, loginAdmin } = require("../supertest.setup");
const { testAuthHeader } = require("../common/auth");

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
      about:
        "Dr. Olivia Anderson is a dedicated and experienced cardiologist, currently practicing at AZ Groeninge. With a patient-first approach, she has successfully treated numerous patients, earning a 5-star rating. Her commitment to her profession is reflected in the positive health outcomes of her patients. She continually strives to provide the best cardiac care, keeping herself updated with the latest in cardiology.",
    },
  ],
};

const dataToDelete = {
  appointments: [1, 2, 3],
  patients: [1],
  doctors: [1],
};

describe("Appointments", () => {
  let request, knex, authHeader;

  withServer(({ supertest, knex: k }) => {
    request = supertest;
    knex = k;
  });

  beforeAll(async () => {
    authHeader = await loginAdmin(request);
  });

  const url = "/api/appointments";

  // Begin van de test suite voor de /api/appointments endpoint
  describe("GET /api/appointments", () => {
    // Voer deze functie uit voordat alle tests worden uitgevoerd
    beforeAll(async () => {
      // Voeg testgegevens toe aan de patient, doctor en appointment tabellen
      await knex(tables.patient).insert(data.patients);
      await knex(tables.doctor).insert(data.doctors);
      await knex(tables.appointment).insert(data.appointments);
    });

    // Voer deze functie uit nadat alle tests zijn uitgevoerd
    afterAll(async () => {
      // Verwijder de testgegevens uit de appointment, patient en doctor tabellen
      await knex(tables.appointment)
        .whereIn("id", dataToDelete.appointments)
        .delete();

      await knex(tables.patient).whereIn("id", dataToDelete.patients).delete();

      await knex(tables.doctor).whereIn("id", dataToDelete.doctors).delete();
    });

    // Een individuele test case
    it("should 200 and return all appointments", async () => {
      // Maak een GET request naar de /api/appointments endpoint
      const response = await request.get(url).set("Authorization", authHeader);

      // Verwacht dat de statuscode van de response 200 is
      expect(response.status).toBe(200);

      // Verwacht dat het aantal items in de response body gelijk is aan 3
      expect(response.body.items.length).toBe(3);

      // Verwacht dat het tweede item in de response body gelijk is aan het gegeven object
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

      // Verwacht dat het derde item in de response body gelijk is aan het gegeven object
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
    // einde 1ste test case
    it("should 400 when given an argument", async () => {
      const response = await request
        .get(`${url}?invalid=true`)
        .set("Authorization", authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.query).toHaveProperty("invalid");
    });
    testAuthHeader(() => request.get(url));
  });

  describe("GET /api/appointments/:id", () => {
    beforeEach(async () => {
      // Check if the patient and doctor already exist
      const patientExists = await knex(tables.patient).where("id", 1).first();
      const doctorExists = await knex(tables.doctor).where("id", 1).first();
      const appointmentExists = await knex(tables.appointment)
        .where("id", 1)
        .first();

      if (!patientExists) {
        await knex(tables.patient).insert(data.patients);
      }
      if (!doctorExists) {
        await knex(tables.doctor).insert(data.doctors);
      }
      if (!appointmentExists) {
        await knex(tables.appointment).insert(data.appointments[0]);
      }
    });

    afterEach(async () => {
      // Remove test data
      await knex(tables.appointment).del();
      await knex(tables.patient).del();
      await knex(tables.doctor).del();
    });

    it("it should 200 and return the requested appointment", async () => {
      const response = await request
        .get(`${url}/1`)
        .set("Authorization", authHeader);

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
      const response = await request
        .get(`${url}/2`)
        .set("Authorization", authHeader);

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
      const response = await request
        .get(`${url}/invalid`)
        .set("Authorization", authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.params).toHaveProperty("id");
    });
    testAuthHeader(() => request.get(`${url}/1`));
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
      const response = await request
        .post(url)
        .set("Authorization", authHeader)
        .send({
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
      const response = await request
        .post(url)
        .set("Authorization", authHeader)
        .send({
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
      const response = await request
        .post(url)
        .set("Authorization", authHeader)
        .send({
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
      const response = await request
        .post(url)
        .set("Authorization", authHeader)
        .send({
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
      const response = await request
        .post(url)
        .set("Authorization", authHeader)
        .send({
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
      const response = await request
        .post(url)
        .set("Authorization", authHeader)
        .send({
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
      const response = await request
        .post(url)
        .set("Authorization", authHeader)
        .send({
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
    testAuthHeader(() => request.post(url));
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
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", authHeader)
        .send({
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

    it("should 404 when updating not existing appointment", async () => {
      const response = await request
        .put(`${url}/2`)
        .set("Authorization", authHeader)
        .send({
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
        message: "There is no appointment with id 2.",
        details: {
          id: 2,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it("should 404 when patient does not exist", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", authHeader)
        .send({
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
      const response = await request
        .put(`${url}/4`)
        .set("Authorization", authHeader)
        .send({
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
      const response = await request
        .put(`${url}/4`)
        .set("Authorization", authHeader)
        .send({
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
      const response = await request
        .put(`${url}/4`)
        .set("Authorization", authHeader)
        .send({
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
      const response = await request
        .put(`${url}/4`)
        .set("Authorization", authHeader)
        .send({
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
    testAuthHeader(() => request.put(`${url}/1`));
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
      const response = await request
        .delete(`${url}/1`)
        .set("Authorization", authHeader);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });

    it("should 404 with not existing patient", async () => {
      const response = await request
        .delete(`${url}/4`)
        .set("Authorization", authHeader);

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
      const response = await request
        .delete(`${url}/invalid`)
        .set("Authorization", authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.params).toHaveProperty("id");
    });
    testAuthHeader(() => request.put(`${url}/1`));
  });
});
