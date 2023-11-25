const supertest = require("supertest");
const createServer = require("../../src/createServer");
const { getKnex, tables } = require("../../src/data");

const data = {
  doctors: [
    {
      id: 1,
      name: "Dr. Olivia Anderson",
      speciality: "Cardiologist",
      numberOfPatients: 3, // this week
      photo: "../assets/imgs/doc1.jpg",
      hospital: "AZ Groeninge",
      numberOfRatings: 5,
      rating: "4.8",
      about:
        "Dr. Olivia Anderson is a dedicated and experienced cardiologist...",
      timeSlots: [
        { day: "Monday", time: "8:00 - 16:00" },
        { day: "Tuesday", time: "14:30 - 18:30" },
        { day: "Wednesday", time: "10:00 - 18:00" },
        { day: "Thursday", time: "9:30 - 13:00" },
        { day: "Friday", time: "13:30 - 18:00" },
      ],
    },
    {
      id: 2,
      name: "Dr. Michael Brown Smith",
      speciality: "Dentist",
      numberOfPatients: 2,
      photo: "../assets/imgs/doc2.jpg",
      hospital: "AZ Sint-Jan Brugge-Oostende",
      numberOfRatings: 6,
      rating: "4.5",
      about:
        "Dr. Michael Brown Smith is a highly skilled dentist at AZ Sint-Jan Brugge-Oostende...",
      timeSlots: [
        { day: "Saturday", time: "9:00 - 17:00" },
        { day: "Sunday", time: "14:00 - 17:30" },
        { day: "Monday", time: "14:00 - 18:30" },
        { day: "Tuesday", time: "9:30 - 12:00" },
        { day: "Wednesday", time: "13:30 - 17:30" },
      ],
    },
    {
      id: 3,
      name: "Dr. John Davis Wilson",
      speciality: "Orthopedic Surgeon",
      numberOfPatients: 1,
      photo: "../assets/imgs/doc3.jpg",
      hospital: "AZ Turnhout",
      numberOfRatings: 7,
      rating: "4.7",
      about:
        "Dr. John Davis Wilson is a renowned orthopedic surgeon at AZ Turnhout...",
      timeSlots: [
        { day: "Monday", time: "15:30 - 19:30" },
        { day: "Tuesday", time: "8:30 - 16:30" },
        { day: "Wednesday", time: "14:00 - 17:30" },
        { day: "Thursday", time: "11:30 - 15:00" },
        { day: "Friday", time: "16:00 - 20:00" },
      ],
    },
  ],
};

const dataToDelete = {
  doctors: [1, 2, 3],
};

describe("Doctors", () => {
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

  const url = "/api/doctors";

  describe("GET /api/doctors", () => {
    beforeAll(async () => {
      await knex(tables.doctor).insert(
        data.doctors.map((doctor) => ({
          ...doctor,
          timeSlots: JSON.stringify(doctor.timeSlots),
        }))
      );
    });

    afterAll(async () => {
      await knex(tables.doctor).whereIn("id", dataToDelete.doctors).delete();
    });

    it("should 200 and return all doctors", async () => {
      const response = await request.get(url);

      expect(response.statusCode).toBe(200);
      expect(response.body.count).toBe(3);
      expect(response.body.items.length).toBe(3);

      expect(response.body.items).toEqual(
        expect.arrayContaining([
          {
            id: 1,
            name: "Dr. Olivia Anderson",
            speciality: "Cardiologist",
            numberOfPatients: 3,
            photo: "../assets/imgs/doc1.jpg",
            hospital: "AZ Groeninge",
            numberOfRatings: 5,
            rating: "4.8",
            about:
              "Dr. Olivia Anderson is a dedicated and experienced cardiologist...",
            timeSlots: [
              { day: "Monday", time: "8:00 - 16:00" },
              { day: "Tuesday", time: "14:30 - 18:30" },
              { day: "Wednesday", time: "10:00 - 18:00" },
              { day: "Thursday", time: "9:30 - 13:00" },
              { day: "Friday", time: "13:30 - 18:00" },
            ],
          },
          {
            id: 3,
            name: "Dr. John Davis Wilson",
            speciality: "Orthopedic Surgeon",
            numberOfPatients: 1,
            photo: "../assets/imgs/doc3.jpg",
            hospital: "AZ Turnhout",
            numberOfRatings: 7,
            rating: "4.7",
            about:
              "Dr. John Davis Wilson is a renowned orthopedic surgeon at AZ Turnhout...",
            timeSlots: [
              { day: "Monday", time: "15:30 - 19:30" },
              { day: "Tuesday", time: "8:30 - 16:30" },
              { day: "Wednesday", time: "14:00 - 17:30" },
              { day: "Thursday", time: "11:30 - 15:00" },
              { day: "Friday", time: "16:00 - 20:00" },
            ],
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

  describe("GET /api/doctor/:id", () => {
    beforeAll(async () => {
      // Convert timeSlots to a JSON string before inserting
      await knex(tables.doctor).insert({
        ...data.doctors[0],
        timeSlots: JSON.stringify(data.doctors[0].timeSlots),
      });
    });

    afterAll(async () => {
      await knex(tables.doctor).whereIn("id", dataToDelete.doctors).delete();
    });

    it("should 200 and return the requested doctor", async () => {
      const response = await request.get(`${url}/1`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: "Dr. Olivia Anderson",
        speciality: "Cardiologist",
        numberOfPatients: 3,
        photo: "../assets/imgs/doc1.jpg",
        hospital: "AZ Groeninge",
        numberOfRatings: 5,
        rating: "4.8",
        about:
          "Dr. Olivia Anderson is a dedicated and experienced cardiologist...",
        timeSlots: [
          { day: "Monday", time: "8:00 - 16:00" },
          { day: "Tuesday", time: "14:30 - 18:30" },
          { day: "Wednesday", time: "10:00 - 18:00" },
          { day: "Thursday", time: "9:30 - 13:00" },
          { day: "Friday", time: "13:30 - 18:00" },
        ],
      });
    });

    it("should 404 when requesting not existing doctor", async () => {
      const response = await request.get(`${url}/2`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: "NOT_FOUND",
        message: "No doctor with id 2 exists",
        details: {
          id: 2,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it("should 400 with invalid doctor id", async () => {
      const response = await request.get(`${url}/invalid`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.params).toHaveProperty("id");
    });
  });

  describe("POST /api/doctors", () => {
    const doctorsToDelete = [];

    afterAll(async () => {
      // Delete the new doctors
      await knex(tables.doctor).whereIn("id", doctorsToDelete).delete();
    });

    it("should 201 and return the created doctor", async () => {
      const response = await request.post(url).send({
        name: "New doctor",
        speciality: "new speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/new_doctor.jpg",
        hospital: "New Hospital",
        numberOfRatings: 5,
        rating: "4.5",
        about: "About new doctor...",
        timeSlots: [
          { day: "Monday", time: "9:00 - 17:00" },
          { day: "Tuesday", time: "13:00 - 18:00" },
          { day: "Wednesday", time: "10:30 - 15:30" },
        ],
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.name).toBe("New doctor");
      expect(response.body.speciality).toBe("new speciality");
      expect(response.body.numberOfPatients).toBe(3);
      expect(response.body.photo).toBe("../assets/imgs/new_doctor.jpg");

      doctorsToDelete.push(response.body.id);
    });

    it("should 400 when missing name", async () => {
      const response = await request.post(url).send({
        speciality: "new speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/new_doctor.jpg",
        hospital: "New Hospital",
        numberOfRatings: 5,
        rating: "4.5",
        about: "About new doctor...",
        timeSlots: [
          { day: "Monday", time: "9:00 - 17:00" },
          { day: "Tuesday", time: "13:00 - 18:00" },
          { day: "Wednesday", time: "10:30 - 15:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("name");
    });

    it("should 400 when missing speciality", async () => {
      const response = await request.post(url).send({
        name: "New doctor",
        numberOfPatients: 3,
        photo: "../assets/imgs/new_doctor.jpg",
        hospital: "New Hospital",
        numberOfRatings: 5,
        rating: "4.5",
        about: "About new doctor...",
        timeSlots: [
          { day: "Monday", time: "9:00 - 17:00" },
          { day: "Tuesday", time: "13:00 - 18:00" },
          { day: "Wednesday", time: "10:30 - 15:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("speciality");
    });

    it("should 400 when missing numberOfPatients", async () => {
      const response = await request.post(url).send({
        name: "New doctor",
        speciality: "new speciality",
        photo: "../assets/imgs/new_doctor.jpg",
        hospital: "New Hospital",
        numberOfRatings: 5,
        rating: "4.5",
        about: "About new doctor...",
        timeSlots: [
          { day: "Monday", time: "9:00 - 17:00" },
          { day: "Tuesday", time: "13:00 - 18:00" },
          { day: "Wednesday", time: "10:30 - 15:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("numberOfPatients");
    });

    it("should 400 when missing photo", async () => {
      const response = await request.post(url).send({
        name: "New doctor",
        speciality: "new speciality",
        numberOfPatients: 3,
        hospital: "New Hospital",
        numberOfRatings: 5,
        rating: "4.5",
        about: "About new doctor...",
        timeSlots: [
          { day: "Monday", time: "9:00 - 17:00" },
          { day: "Tuesday", time: "13:00 - 18:00" },
          { day: "Wednesday", time: "10:30 - 15:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("photo");
    });

    it("should 400 when missing hospital", async () => {
      const response = await request.post(url).send({
        name: "New doctor",
        speciality: "new speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/new_doctor.jpg",
        numberOfRatings: 5,
        rating: "4.5",
        about: "About new doctor...",
        timeSlots: [
          { day: "Monday", time: "9:00 - 17:00" },
          { day: "Tuesday", time: "13:00 - 18:00" },
          { day: "Wednesday", time: "10:30 - 15:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("hospital");
    });

    it("should 400 when missing numberOfRatings", async () => {
      const response = await request.post(url).send({
        name: "New doctor",
        speciality: "new speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/new_doctor.jpg",
        hospital: "New Hospital",
        rating: "4.5",
        about: "About new doctor...",
        timeSlots: [
          { day: "Monday", time: "9:00 - 17:00" },
          { day: "Tuesday", time: "13:00 - 18:00" },
          { day: "Wednesday", time: "10:30 - 15:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("numberOfRatings");
    });

    it("should 400 when missing rating", async () => {
      const response = await request.post(url).send({
        name: "New doctor",
        speciality: "new speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/new_doctor.jpg",
        hospital: "New Hospital",
        numberOfRatings: 5,
        about: "About new doctor...",
        timeSlots: [
          { day: "Monday", time: "9:00 - 17:00" },
          { day: "Tuesday", time: "13:00 - 18:00" },
          { day: "Wednesday", time: "10:30 - 15:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("rating");
    });

    it("should 400 when missing about", async () => {
      const response = await request.post(url).send({
        name: "New doctor",
        speciality: "new speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/new_doctor.jpg",
        hospital: "New Hospital",
        numberOfRatings: 5,
        rating: "4.5",
        timeSlots: [
          { day: "Monday", time: "9:00 - 17:00" },
          { day: "Tuesday", time: "13:00 - 18:00" },
          { day: "Wednesday", time: "10:30 - 15:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("about");
    });

    it("should 400 when missing timeSlots", async () => {
      const response = await request.post(url).send({
        name: "New doctor",
        speciality: "new speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/new_doctor.jpg",
        hospital: "New Hospital",
        numberOfRatings: 5,
        rating: "4.5",
        about: "About new doctor...",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("timeSlots");
    });
  });

  describe("PUT /api/doctors/:id", () => {
    beforeAll(async () => {
      // Convert timeSlots to a JSON string before inserting
      await knex(tables.doctor).insert({
        ...data.doctors[0],
        timeSlots: JSON.stringify(data.doctors[0].timeSlots),
      });
    });

    afterAll(async () => {
      await knex(tables.doctor).whereIn("id", dataToDelete.doctors).delete();
    });

    it("should 200 and return the updated doctor", async () => {
      const response = await request.put(`${url}/1`).send({
        name: "Changed name",
        speciality: "updated speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/doc1.jpg",
        hospital: "Updated Hospital",
        numberOfRatings: 6,
        rating: "4.9",
        about: "Updated about...",
        timeSlots: [
          { day: "Monday", time: "10:00 - 18:00" },
          { day: "Tuesday", time: "14:00 - 20:00" },
          { day: "Wednesday", time: "8:30 - 16:30" },
        ],
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: "Changed name",
        speciality: "updated speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/doc1.jpg",
        hospital: "Updated Hospital",
        numberOfRatings: 6,
        rating: "4.9",
        about: "Updated about...",
        timeSlots: [
          { day: "Monday", time: "10:00 - 18:00" },
          { day: "Tuesday", time: "14:00 - 20:00" },
          { day: "Wednesday", time: "8:30 - 16:30" },
        ],
      });
    });

    it("should 400 when missing name", async () => {
      const response = await request.put(`${url}/1`).send({
        speciality: "updated speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/doc1.jpg",
        hospital: "Updated Hospital",
        numberOfRatings: 6,
        rating: "4.9",
        about: "Updated about...",
        timeSlots: [
          { day: "Monday", time: "10:00 - 18:00" },
          { day: "Tuesday", time: "14:00 - 20:00" },
          { day: "Wednesday", time: "8:30 - 16:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("name");
    });

    it("should return 400 when missing speciality", async () => {
      const response = await request.put(`${url}/1`).send({
        name: "Changed name",
        numberOfPatients: 3,
        photo: "../assets/imgs/doc1.jpg",
        hospital: "Updated Hospital",
        numberOfRatings: 6,
        rating: "4.9",
        about: "Updated about...",
        timeSlots: [
          { day: "Monday", time: "10:00 - 18:00" },
          { day: "Tuesday", time: "14:00 - 20:00" },
          { day: "Wednesday", time: "8:30 - 16:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("speciality");
    });

    it("should return 400 when missing numberOfPatients", async () => {
      const response = await request.put(`${url}/1`).send({
        name: "Changed name",
        speciality: "updated speciality",
        photo: "../assets/imgs/doc1.jpg",
        hospital: "Updated Hospital",
        numberOfRatings: 6,
        rating: "4.9",
        about: "Updated about...",
        timeSlots: [
          { day: "Monday", time: "10:00 - 18:00" },
          { day: "Tuesday", time: "14:00 - 20:00" },
          { day: "Wednesday", time: "8:30 - 16:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("numberOfPatients");
    });

    it("should return 400 when missing photo", async () => {
      const response = await request.put(`${url}/1`).send({
        name: "Changed name",
        speciality: "updated speciality",
        numberOfPatients: 3,
        hospital: "Updated Hospital",
        numberOfRatings: 6,
        rating: "4.9",
        about: "Updated about...",
        timeSlots: [
          { day: "Monday", time: "10:00 - 18:00" },
          { day: "Tuesday", time: "14:00 - 20:00" },
          { day: "Wednesday", time: "8:30 - 16:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("photo");
    });

    it("should return 400 when missing hospital", async () => {
      const response = await request.put(`${url}/1`).send({
        name: "Changed name",
        speciality: "updated speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/doc1.jpg",
        numberOfRatings: 6,
        rating: "4.9",
        about: "Updated about...",
        timeSlots: [
          { day: "Monday", time: "10:00 - 18:00" },
          { day: "Tuesday", time: "14:00 - 20:00" },
          { day: "Wednesday", time: "8:30 - 16:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("hospital");
    });

    it("should return 400 when missing numberOfRatings", async () => {
      const response = await request.put(`${url}/1`).send({
        name: "Changed name",
        speciality: "updated speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/doc1.jpg",
        hospital: "Updated Hospital",
        rating: "4.9",
        about: "Updated about...",
        timeSlots: [
          { day: "Monday", time: "10:00 - 18:00" },
          { day: "Tuesday", time: "14:00 - 20:00" },
          { day: "Wednesday", time: "8:30 - 16:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("numberOfRatings");
    });

    it("should return 400 when missing rating", async () => {
      const response = await request.put(`${url}/1`).send({
        name: "Changed name",
        speciality: "updated speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/doc1.jpg",
        hospital: "Updated Hospital",
        numberOfRatings: 6,
        about: "Updated about...",
        timeSlots: [
          { day: "Monday", time: "10:00 - 18:00" },
          { day: "Tuesday", time: "14:00 - 20:00" },
          { day: "Wednesday", time: "8:30 - 16:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("rating");
    });

    it("should return 400 when missing about", async () => {
      const response = await request.put(`${url}/1`).send({
        name: "Changed name",
        speciality: "updated speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/doc1.jpg",
        hospital: "Updated Hospital",
        numberOfRatings: 6,
        rating: "4.9",
        timeSlots: [
          { day: "Monday", time: "10:00 - 18:00" },
          { day: "Tuesday", time: "14:00 - 20:00" },
          { day: "Wednesday", time: "8:30 - 16:30" },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("about");
    });

    it("should return 400 when missing timeSlots", async () => {
      const response = await request.put(`${url}/1`).send({
        name: "Changed name",
        speciality: "updated speciality",
        numberOfPatients: 3,
        photo: "../assets/imgs/doc1.jpg",
        hospital: "Updated Hospital",
        numberOfRatings: 6,
        rating: "4.9",
        about: "Updated about...",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("timeSlots");
    });
  });

  describe("DELETE /api/doctors/:id", () => {
    beforeAll(async () => {
      // Convert timeSlots to a JSON string before inserting
      await knex(tables.doctor).insert({
        ...data.doctors[0],
        timeSlots: JSON.stringify(data.doctors[0].timeSlots),
      });
    });

    it("should 204 and return nothing", async () => {
      const response = await request.delete(`${url}/1`);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });
    it("should 404 with not existing doctor", async () => {
      const response = await request.delete(`${url}/1`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: "NOT_FOUND",
        message: "No doctor with id 1 exists",
        details: {
          id: 1,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it("should 400 with invalid doctor id", async () => {
      const response = await request.get(`${url}/invalid`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.params).toHaveProperty("id");
    });
  });
});
