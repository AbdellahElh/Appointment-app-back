let PATIENT_DATA = [
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
];

let APPOINTMENT_DATA = [
  {
    id: 1,
    date: new Date(2023, 9, 20, 10, 30),
    description: "Annual Health Checkup",
    condition: "Chest pain and shortness of breath",
    patient: {
      id: 1,
      name: "Emily Smith",
    },
    doctor: {
      id: 1,
      name: "Dr. Olivia Williams Anderson",
    },
  },
  {
    id: 2,
    date: new Date(2023, 9, 25, 15, 15),
    description: "Dental Cleaning",
    condition: "Toothache and cavity",
    patient: {
      id: 2,
      name: "David Brown",
    },
    doctor: {
      id: 2,
      name: "Dr. Michael Brown Smith",
    },
  },
  {
    id: 3,
    date: new Date(2023, 10, 5, 11, 0),
    description: "Orthopedic Consultation",
    condition: "Knee pain and difficulty walking",
    patient: {
      id: 3,
      name: "Sophia Davis",
    },
    doctor: {
      id: 3,
      name: "Dr. Jessica Davis Wilson",
    },
  },
];

let DOCTOR_DATA = [
  {
    id: 1,
    name: "Dr. Olivia Anderson",
    speciality: "Cardiologist",
    photo: "../assets/imgs/doc1.jpg",
    hospital: "AZ Groeninge",
    about:
      "Dr. Olivia Anderson is a dedicated and experienced cardiologist, currently practicing at AZ Groeninge. With a patient-first approach, she has successfully treated numerous patients, earning a 5-star rating. Her commitment to her profession is reflected in the positive health outcomes of her patients. She continually strives to provide the best cardiac care, keeping herself updated with the latest in cardiology.",
  },
  {
    id: 2,
    name: "Dr. Michael Brown Smith",
    speciality: "Dentist",
    photo: "../assets/imgs/doc2.jpg",
    hospital: "AZ Sint-Jan Brugge-Oostende",
    about:
      "Dr. Michael Brown Smith is a highly skilled dentist at AZ Sint-Jan Brugge-Oostende. He has a patient-centric approach and is known for his gentle and efficient dental procedures. His patients appreciate his thoroughness and his commitment to their dental health, earning him a 4.5-star rating.",
  },
  {
    id: 3,
    name: "Dr. John Davis Wilson",
    speciality: "Orthopedic Surgeon",
    photo: "../assets/imgs/doc3.jpg",
    hospital: "AZ Turnhout",
    about:
      "Dr. John Davis Wilson is a renowned orthopedic surgeon at AZ Turnhout. He specializes in diagnosing and treating disorders related to the musculoskeletal system. His dedication to his patients and his field is evident in his work, earning him a 4-star rating. He is committed to helping his patients regain mobility and improve their quality of life.",
  },
];

module.exports = { PATIENT_DATA, APPOINTMENT_DATA, DOCTOR_DATA };
