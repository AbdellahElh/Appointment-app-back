const { tables } = require("../../src/data");
const Role = require("../../src/core/roles");
const { withServer, loginAdmin, loginDoctor } = require("../supertest.setup");
const { testAuthHeader } = require("../common/auth");

const data = {
  users: [
    {
      id: 10,
      email: "olivia.anderson@gmail.com",
      password_hash: "doesntmatter",
      roles: JSON.stringify([Role.DOCTOR]),
    },
    {
      id: 11,
      email: "michael.brown@gmail.com",
      password_hash: "doesntmatter",
      roles: JSON.stringify([Role.DOCTOR]),
    },
    {
      id: 12,
      email: "john.wilson@gmail.com",
      password_hash: "doesntmatter",
      roles: JSON.stringify([Role.DOCTOR]),
    },
  ],
  doctors: [
    {
      id: 1,
      name: "Dr. Olivia Anderson",
      speciality: "Cardiologist",
      // numberOfPatients: 3, // this week
      photo: "../assets/imgs/doc1.jpg",
      hospital: "AZ Groeninge",
      // numberOfRatings: 5,
      rating: "4.8",
      about:
        "Dr. Olivia Anderson is a dedicated and experienced cardiologist...",
      // timeSlots: [
      //   { day: "Monday", time: "8:00 - 16:00" },
      //   { day: "Tuesday", time: "14:30 - 18:30" },
      //   { day: "Wednesday", time: "10:00 - 18:00" },
      //   { day: "Thursday", time: "9:30 - 13:00" },
      //   { day: "Friday", time: "13:30 - 18:00" },
      // ],
    },
    {
      id: 2,
      name: "Dr. Michael Brown Smith",
      speciality: "Dentist",
      // numberOfPatients: 2,
      photo: "../assets/imgs/doc2.jpg",
      hospital: "AZ Sint-Jan Brugge-Oostende",
      // numberOfRatings: 6,
      rating: "4.5",
      about:
        "Dr. Michael Brown Smith is a highly skilled dentist at AZ Sint-Jan Brugge-Oostende...",
      // timeSlots: [
      //   { day: "Saturday", time: "9:00 - 17:00" },
      //   { day: "Sunday", time: "14:00 - 17:30" },
      //   { day: "Monday", time: "14:00 - 18:30" },
      //   { day: "Tuesday", time: "9:30 - 12:00" },
      //   { day: "Wednesday", time: "13:30 - 17:30" },
      // ],
    },
    {
      id: 3,
      name: "Dr. John Davis Wilson",
      speciality: "Orthopedic Surgeon",
      // numberOfPatients: 1,
      photo: "../assets/imgs/doc3.jpg",
      hospital: "AZ Turnhout",
      // numberOfRatings: 7,
      rating: "4.7",
      about:
        "Dr. John Davis Wilson is a renowned orthopedic surgeon at AZ Turnhout...",
      // timeSlots: [
      //   { day: "Monday", time: "15:30 - 19:30" },
      //   { day: "Tuesday", time: "8:30 - 16:30" },
      //   { day: "Wednesday", time: "14:00 - 17:30" },
      //   { day: "Thursday", time: "11:30 - 15:00" },
      //   { day: "Friday", time: "16:00 - 20:00" },
      // ],
    },
  ],
};

const dataToDelete = {
  doctors: [1, 2, 3],
  users: [10, 11, 12],
};

describe("Doctors", () => {
  let request, knex, authHeader, adminAuthHeader;

  withServer(({ supertest, knex: k }) => {
    request = supertest;
    knex = k;
  });

  beforeAll(async () => {
    authHeader = await loginDoctor(request);
    adminAuthHeader = await loginAdmin(request);
  });

  const url = "/api/doctors";

  describe("GET /api/doctors", () => {
    beforeAll(async () => {
      // Check if the user already exists
      for (const user of data.users) {
        const userExists = await knex(tables.user).where("id", user.id).first();

        // Only insert the user if it doesn't already exist
        if (!userExists) {
          await knex(tables.user).insert(user);
        }
      }
      for (const doctor of data.doctors) {
        const doctorExists = await knex(tables.doctor)
          .where("id", doctor.id)
          .first();
        if (!doctorExists) {
          await knex(tables.doctor).insert(doctor);
        }
      }
    });

    afterAll(async () => {
      await knex(tables.doctor).whereIn("id", dataToDelete.doctors).delete();
    });

    it("should 200 and return all doctors", async () => {
      const response = await request.get(url).set("Authorization", authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.count).toBe(3);
      expect(response.body.items.length).toBe(3);

      expect(response.body.items[1]).toEqual({
        id: 1,
        name: "Dr. Olivia Anderson",
        email: "olivia.anderson@gmail.com",
        roles: [Role.DOCTOR],
        speciality: "Cardiologist",
        // numberOfPatients: 3,
        photo: "../assets/imgs/doc1.jpg",
        hospital: "AZ Groeninge",
        // numberOfRatings: 5,
        rating: "4.8",
        about:
          "Dr. Olivia Anderson is a dedicated and experienced cardiologist...",
        // timeSlots: [
        //   { day: "Monday", time: "8:00 - 16:00" },
        //   { day: "Tuesday", time: "14:30 - 18:30" },
        //   { day: "Wednesday", time: "10:00 - 18:00" },
        //   { day: "Thursday", time: "9:30 - 13:00" },
        //   { day: "Friday", time: "13:30 - 18:00" },
        // ],
      });
      expect(response.body.items[0]).toEqual({
        id: 3,
        name: "Dr. John Davis Wilson",
        email: "john.wilson@gmailcom",
        speciality: "Orthopedic Surgeon",
        // numberOfPatients: 1,
        photo: "../assets/imgs/doc3.jpg",
        hospital: "AZ Turnhout",
        // numberOfRatings: 7,
        rating: "4.7",
        about:
          "Dr. John Davis Wilson is a renowned orthopedic surgeon at AZ Turnhout...",
        // timeSlots: [
        //   { day: "Monday", time: "15:30 - 19:30" },
        //   { day: "Tuesday", time: "8:30 - 16:30" },
        //   { day: "Wednesday", time: "14:00 - 17:30" },
        //   { day: "Thursday", time: "11:30 - 15:00" },
        //   { day: "Friday", time: "16:00 - 20:00" },
        // ],
      });
    });
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

  describe("GET /api/doctor/:id", () => {
    beforeAll(async () => {
      await knex(tables.user).insert(data.users);
      // Convert timeSlots to a JSON string before inserting
      await knex(tables.doctor).insert(doctor);
    });

    afterAll(async () => {
      await knex(tables.doctor).whereIn("id", dataToDelete.doctors).delete();
    });

    it("should 200 and return the requested doctor", async () => {
      const response = await request
        .get(`${url}/1`)
        .set("Authorization", authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: "Dr. Olivia Anderson",
        speciality: "Cardiologist",
        // numberOfPatients: 3,
        photo: "../assets/imgs/doc1.jpg",
        hospital: "AZ Groeninge",
        // numberOfRatings: 5,
        rating: "4.8",
        about:
          "Dr. Olivia Anderson is a dedicated and experienced cardiologist...",
        // timeSlots: [
        //   { day: "Monday", time: "8:00 - 16:00" },
        //   { day: "Tuesday", time: "14:30 - 18:30" },
        //   { day: "Wednesday", time: "10:00 - 18:00" },
        //   { day: "Thursday", time: "9:30 - 13:00" },
        //   { day: "Friday", time: "13:30 - 18:00" },
        // ],
      });
    });

    it("should 404 when requesting not existing doctor", async () => {
      const response = await request
        .get(`${url}/222`)
        .set("Authorization", authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        code: "NOT_FOUND",
        message: "No doctor with id 222 exists",
        details: {
          id: 222,
        },
      });
      expect(response.body.stack).toBeTruthy();
    });

    it("should 400 with invalid doctor id", async () => {
      const response = await request
        .get(`${url}/invalid`)
        .set("Authorization", authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.params).toHaveProperty("id");
    });
    testAuthHeader(() => request.get(`${url}/1`));
  });

  describe("POST /api/doctors/register", () => {
    const doctorsToDelete = [];

    afterAll(async () => {
      // Delete the new doctors
      await knex(tables.doctor).whereIn("id", doctorsToDelete).delete();
    });

    it("should 200 and return the created doctor", async () => {
      const response = await request.post(`${url}/register`).send({
        name: "New registered doc",
        email: "doctor@user.com",
        password: "12345678",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.user.id).toBeTruthy();
      expect(response.body.user.name).toBe("New registered doc");
      expect(response.body.user.email).toBe("doctor@user.com");
      expect(response.body.user.roles).toContain("DOCTOR");
      expect(response.body.user.speciality).toBe("Default Speciality");
      // expect(response.body.user.numberOfPatients).toBe(0);
      expect(response.body.user.photo).toBe("https://i.imgur.com/2WZtVXx.png");
      expect(response.body.user.hospital).toBe("Default Hospital");
      // expect(response.body.user.numberOfRatings).toBe(0);
      expect(response.body.user.rating).toBe("0");
      expect(response.body.user.about).toBeNull();
      // expect(response.body.user.timeSlots).toBeNull();
      expect(response.body.token).toBeTruthy();

      doctorsToDelete.push(response.body.user.id);
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

  describe("PUT /api/doctors/:id", () => {
    beforeAll(async () => {
      await knex(tables.user).insert(data.users);
      // Convert timeSlots to a JSON string before inserting
      await knex(tables.doctor).insert(doctor);
    });

    afterAll(async () => {
      await knex(tables.doctor).whereIn("id", dataToDelete.doctors).delete();
    });

    it("should 200 and return the updated doctor", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .set("Authorization", adminAuthHeader)
        .send({
          name: "Changed name",
          speciality: "updated speciality",
          // numberOfPatients: 3,
          photo: "../assets/imgs/doc1.jpg",
          hospital: "Updated Hospital",
          // numberOfRatings: 6,
          rating: "4.9",
          about: "Updated about...",
          // timeSlots: [
          //   { day: "Monday", time: "10:00 - 18:00" },
          //   { day: "Tuesday", time: "14:00 - 20:00" },
          //   { day: "Wednesday", time: "8:30 - 16:30" },
          // ],
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: "Changed name",
        speciality: "updated speciality",
        // numberOfPatients: 3,
        photo: "../assets/imgs/doc1.jpg",
        hospital: "Updated Hospital",
        // numberOfRatings: 6,
        rating: "4.9",
        about: "Updated about...",
        // timeSlots: [
        //   { day: "Monday", time: "10:00 - 18:00" },
        //   { day: "Tuesday", time: "14:00 - 20:00" },
        //   { day: "Wednesday", time: "8:30 - 16:30" },
        // ],
      });
    });

    it("should 400 when missing name", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .set("Authorization", adminAuthHeader)
        .send({
          speciality: "updated speciality",
          // numberOfPatients: 3,
          photo: "../assets/imgs/doc1.jpg",
          hospital: "Updated Hospital",
          // numberOfRatings: 6,
          rating: "4.9",
          about: "Updated about...",
          // timeSlots: [
          //   { day: "Monday", time: "10:00 - 18:00" },
          //   { day: "Tuesday", time: "14:00 - 20:00" },
          //   { day: "Wednesday", time: "8:30 - 16:30" },
          // ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("name");
    });

    it("should return 400 when missing speciality", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .set("Authorization", adminAuthHeader)
        .send({
          name: "Changed name",
          // numberOfPatients: 3,
          photo: "../assets/imgs/doc1.jpg",
          hospital: "Updated Hospital",
          // numberOfRatings: 6,
          rating: "4.9",
          about: "Updated about...",
          // timeSlots: [
          //   { day: "Monday", time: "10:00 - 18:00" },
          //   { day: "Tuesday", time: "14:00 - 20:00" },
          //   { day: "Wednesday", time: "8:30 - 16:30" },
          // ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("speciality");
    });

    it("should return 400 when missing photo", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .send({
          name: "Changed name",
          speciality: "updated speciality",
          // numberOfPatients: 3,
          hospital: "Updated Hospital",
          // numberOfRatings: 6,
          rating: "4.9",
          about: "Updated about...",
          // timeSlots: [
          //   { day: "Monday", time: "10:00 - 18:00" },
          //   { day: "Tuesday", time: "14:00 - 20:00" },
          //   { day: "Wednesday", time: "8:30 - 16:30" },
          // ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("photo");
    });

    it("should return 400 when missing hospital", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .send({
          name: "Changed name",
          speciality: "updated speciality",
          // numberOfPatients: 3,
          photo: "../assets/imgs/doc1.jpg",
          // numberOfRatings: 6,
          rating: "4.9",
          about: "Updated about...",
          // timeSlots: [
          //   { day: "Monday", time: "10:00 - 18:00" },
          //   { day: "Tuesday", time: "14:00 - 20:00" },
          //   { day: "Wednesday", time: "8:30 - 16:30" },
          // ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("hospital");
    });

    it("should return 400 when missing rating", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .send({
          name: "Changed name",
          speciality: "updated speciality",
          // numberOfPatients: 3,
          photo: "../assets/imgs/doc1.jpg",
          hospital: "Updated Hospital",
          // numberOfRatings: 6,
          about: "Updated about...",
          // timeSlots: [
          //   { day: "Monday", time: "10:00 - 18:00" },
          //   { day: "Tuesday", time: "14:00 - 20:00" },
          //   { day: "Wednesday", time: "8:30 - 16:30" },
          // ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("rating");
    });

    it("should return 400 when missing about", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .send({
          name: "Changed name",
          speciality: "updated speciality",
          // numberOfPatients: 3,
          photo: "../assets/imgs/doc1.jpg",
          hospital: "Updated Hospital",
          // numberOfRatings: 6,
          rating: "4.9",
          // timeSlots: [
          //   { day: "Monday", time: "10:00 - 18:00" },
          //   { day: "Tuesday", time: "14:00 - 20:00" },
          //   { day: "Wednesday", time: "8:30 - 16:30" },
          // ],
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("about");
    });
    testAuthHeader(() => request.put(`${url}/1`));
  });

  describe("DELETE /api/doctors/:id", () => {
    beforeAll(async () => {
      await knex(tables.user).insert(data.users);
      // Convert timeSlots to a JSON string before inserting
      await knex(tables.doctor).insert(doctor);
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
    testAuthHeader(() => request.delete(`${url}/1`));
  });
});
