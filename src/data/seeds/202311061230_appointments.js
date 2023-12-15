const { tables } = require("..");

module.exports = {
  seed: async (knex) => {
    await knex(tables.appointment).delete();

    await knex(tables.appointment).insert([
      {
        id: 1,
        patient_id: 1,
        doctor_id: 10,
        description: "Annual Health Checkup",
        numberOfBeds: 3,
        condition: "Chest pain and shortness of breath",
        date: new Date(2023, 11, 15, 8, 15),
      },
      {
        id: 2,
        patient_id: 2,
        doctor_id: 11,
        description: "Dental Cleaning",
        numberOfBeds: 2,
        condition: "Toothache and cavity",
        date: new Date(2023, 10, 25, 15, 15),
      },
      {
        id: 3,
        patient_id: 3,
        doctor_id: 12,
        description: "Orthopedic Consultation",
        numberOfBeds: 1,
        condition: "Knee pain and difficulty walking",
        date: new Date(2023, 9, 30, 12, 45),
      },

      {
        id: 4,
        patient_id: 1,
        doctor_id: 10,
        description: "Eye Exam",
        numberOfBeds: 1,
        condition: "Blurred vision and eye irritation",
        date: new Date(2023, 11, 18, 10, 30),
      },
      {
        id: 5,
        patient_id: 2,
        doctor_id: 11,
        description: "Allergy Consultation",
        numberOfBeds: 2,
        condition: "Persistent sneezing and itching",
        date: new Date(2023, 10, 28, 14, 0),
      },
      {
        id: 6,
        patient_id: 3,
        doctor_id: 12,
        description: "Gastroenterology Checkup",
        numberOfBeds: 3,
        condition: "Abdominal pain and indigestion",
        date: new Date(2023, 9, 25, 11, 15),
      },
      {
        id: 7,
        patient_id: 1,
        doctor_id: 10,
        description: "Cardiology Follow-up",
        numberOfBeds: 1,
        condition: "High blood pressure and palpitations",
        date: new Date(2023, 11, 5, 9, 45),
      },
      {
        id: 8,
        patient_id: 2,
        doctor_id: 11,
        description: "Pulmonology Evaluation",
        numberOfBeds: 2,
        condition: "Persistent cough and shortness of breath",
        date: new Date(2023, 10, 10, 13, 20),
      },
      {
        id: 9,
        patient_id: 3,
        doctor_id: 12,
        description: "Neurology Consultation",
        numberOfBeds: 3,
        condition: "Headaches and dizziness",
        date: new Date(2023, 9, 15, 16, 0),
      },
    ]);
  },
};
