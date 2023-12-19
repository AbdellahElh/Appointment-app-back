const { tables } = require("..");

module.exports = {
  seed: async (knex) => {
    await knex(tables.doctor).delete();
    await knex(tables.doctor).insert([
      {
        id: 10,
        name: "Dr. Olivia Anderson",
        speciality: "Cardiologist",
        photo: "../assets/imgs/doc1.jpg",
        hospital: "AZ Groeninge",
        about:
          "Dr. Olivia Anderson is a dedicated and experienced cardiologist, currently practicing at AZ Groeninge. With a patient-first approach, she has successfully treated numerous patients, earning a 5-star rating. Her commitment to her profession is reflected in the positive health outcomes of her patients. She continually strives to provide the best cardiac care, keeping herself updated with the latest in cardiology.",
      },
      {
        id: 11,
        name: "Dr. Michael Brown Smith",
        speciality: "Dentist",
        photo: "../assets/imgs/doc2.jpg",
        hospital: "AZ Sint-Jan Brugge-Oostende",
        about:
          "Dr. Michael Brown Smith is a highly skilled dentist at AZ Sint-Jan Brugge-Oostende. He has a patient-centric approach and is known for his gentle and efficient dental procedures. His patients appreciate his thoroughness and his commitment to their dental health, earning him a 4.5-star rating.",
      },
      {
        id: 12,
        name: "Dr. John Davis Wilson",
        speciality: "Orthopedic Surgeon",
        photo: "../assets/imgs/doc3.jpg",
        hospital: "AZ Turnhout",
        about:
          "Dr. John Davis Wilson is a renowned orthopedic surgeon at AZ Turnhout. He specializes in diagnosing and treating disorders related to the musculoskeletal system. His dedication to his patients and his field is evident in his work, earning him a 4-star rating. He is committed to helping his patients regain mobility and improve their quality of life.",
      },
    ]);
  },
};
