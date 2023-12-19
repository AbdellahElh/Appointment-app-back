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
      photo: "../assets/imgs/doc1.jpg",
      hospital: "AZ Groeninge",
      about:
        "Dr. Olivia Anderson is a dedicated and experienced cardiologist...",
    },
    {
      id: 2,
      name: "Dr. Michael Brown Smith",
      speciality: "Dentist",
      photo: "../assets/imgs/doc2.jpg",
      hospital: "AZ Sint-Jan Brugge-Oostende",
      about:
        "Dr. Michael Brown Smith is a highly skilled dentist at AZ Sint-Jan Brugge-Oostende...",
    },
    {
      id: 3,
      name: "Dr. John Davis Wilson",
      speciality: "Orthopedic Surgeon",
      photo: "../assets/imgs/doc3.jpg",
      hospital: "AZ Turnhout",
      about:
        "Dr. John Davis Wilson is a renowned orthopedic surgeon at AZ Turnhout...",
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
      for (const user of data.users) {
        const userExists = await knex(tables.user).where("id", user.id).first();

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
        photo: "../assets/imgs/doc1.jpg",
        hospital: "AZ Groeninge",
        about:
          "Dr. Olivia Anderson is a dedicated and experienced cardiologist...",
      });
      expect(response.body.items[0]).toEqual({
        id: 3,
        name: "Dr. John Davis Wilson",
        email: "john.wilson@gmailcom",
        speciality: "Orthopedic Surgeon",
        photo: "../assets/imgs/doc3.jpg",
        hospital: "AZ Turnhout",
        about:
          "Dr. John Davis Wilson is a renowned orthopedic surgeon at AZ Turnhout...",
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
        photo: "../assets/imgs/doc1.jpg",
        hospital: "AZ Groeninge",
        about:
          "Dr. Olivia Anderson is a dedicated and experienced cardiologist...",
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
      expect(response.body.user.hospital).toBe("Default Hospital");
      expect(response.body.user.about).toBeNull();
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
          photo: "../assets/imgs/doc1.jpg",
          hospital: "Updated Hospital",
          about: "Updated about...",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: "Changed name",
        speciality: "updated speciality",
        photo: "../assets/imgs/doc1.jpg",
        hospital: "Updated Hospital",
        about: "Updated about...",
      });
    });

    it("should 400 when missing name", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .set("Authorization", adminAuthHeader)
        .send({
          speciality: "updated speciality",
          photo: "../assets/imgs/doc1.jpg",
          hospital: "Updated Hospital",
          about: "Updated about...",
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
          photo: "../assets/imgs/doc1.jpg",
          hospital: "Updated Hospital",
          about: "Updated about...",
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
          hospital: "Updated Hospital",
          about: "Updated about...",
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
          photo: "../assets/imgs/doc1.jpg",
          about: "Updated about...",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe("VALIDATION_FAILED");
      expect(response.body.details.body).toHaveProperty("hospital");
    });

    it("should return 400 when missing about", async () => {
      const response = await request
        .put(`${url}/1`)
        .set("Authorization", adminAuthHeader)
        .send({
          name: "Changed name",
          speciality: "updated speciality",
          photo: "../assets/imgs/doc1.jpg",
          hospital: "Updated Hospital",
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
