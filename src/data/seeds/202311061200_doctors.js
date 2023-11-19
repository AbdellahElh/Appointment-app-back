// const { tables } = require("..");
// module.exports = {
//   seed: async (knex) => {
//     await knex(tables.doctor).delete();
//     await knex(tables.doctor).insert([
//       {
//         id: 1,
//         name: "Dr. Olivia Williams Anderson",
//         speciality: "Cardiologist",
//         numberOfPatients: 3, //this week
//         photo: "../assets/imgs/doc1.jpg",
//       },
//       {
//         id: 2,
//         name: "Dr. Michael Brown Smith",
//         speciality: "Dentist",
//         numberOfPatients: 2,
//         photo: "../assets/imgs/doc2.jpg",
//       },
//       {
//         id: 3,
//         name: "Dr. Jessica Davis Wilson",
//         speciality: "Orthopedic Surgeon",
//         numberOfPatients: 1,
//         photo: "../assets/imgs/doc3.jpg",
//       },
//     ]);
//   },
// };

const { tables } = require("..");

module.exports = {
  seed: async (knex) => {
    await knex(tables.doctor).delete();
    await knex(tables.doctor).insert([
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
          "Dr. Olivia Anderson is a dedicated and experienced cardiologist, currently practicing at AZ Groeninge. With a patient-first approach, she has successfully treated numerous patients, earning a 5-star rating. Her commitment to her profession is reflected in the positive health outcomes of her patients. She continually strives to provide the best cardiac care, keeping herself updated with the latest in cardiology.",
        timeSlots: JSON.stringify([
          { day: "Monday", time: "8:00 - 16:00" },
          { day: "Tuesday", time: "14:30 - 18:30" },
          { day: "Wednesday", time: "10:00 - 18:00" },
          { day: "Thursday", time: "9:30 - 13:00" },
          { day: "Friday", time: "13:30 - 18:00" },
        ]),
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
          "Dr. Michael Brown Smith is a highly skilled dentist at AZ Sint-Jan Brugge-Oostende. He has a patient-centric approach and is known for his gentle and efficient dental procedures. His patients appreciate his thoroughness and his commitment to their dental health, earning him a 4.5-star rating.",
        timeSlots: JSON.stringify([
          { day: "Saturday", time: "9:00 - 17:00" },
          { day: "Sunday", time: "14:00 - 17:30" },
          { day: "Monday", time: "14:00 - 18:30" },
          { day: "Tuesday", time: "9:30 - 12:00" },
          { day: "Wednesday", time: "13:30 - 17:30" },
        ]),
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
          "Dr. John Davis Wilson is a renowned orthopedic surgeon at AZ Turnhout. He specializes in diagnosing and treating disorders related to the musculoskeletal system. His dedication to his patients and his field is evident in his work, earning him a 4-star rating. He is committed to helping his patients regain mobility and improve their quality of life.",
        timeSlots: JSON.stringify([
          { day: "Monday", time: "15:30 - 19:30" },
          { day: "Tuesday", time: "8:30 - 16:30" },
          { day: "Wednesday", time: "14:00 - 17:30" },
          { day: "Thursday", time: "11:30 - 15:00" },
          { day: "Friday", time: "16:00 - 20:00" },
        ]),
      },
    ]);
  },
};
