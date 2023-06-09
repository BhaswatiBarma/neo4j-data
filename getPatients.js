const fs = require('fs');

const getOneRandom = require('./getOneRandom');
const randomiseWords = require('./randomiseWords');

const patientsDummyJson = require('./graph database/patient.json');

const getPatients = (count) => {
  const personsData = require('./json/persons.json');
  return Array(count)
    .fill(1)
    .map((_, index) => ({
      ptId: index + 1,
      Id: getOneRandom(personsData.map(({ id }) => id)),
      alternatePtIds: randomiseWords(
        personsData.map(({ id }) => id),
        1,
        5
      )
        .split(' ')
        .map((v) => parseInt(v)),
      ecpId: getOneRandom(personsData.map(({ id }) => id)),
      ecpRelation: getOneRandom(patientsDummyJson[0].ecpRelation),
      cPAHomeId: Math.random(Math.random() * count * 2),
      cPAHomeRelation: getOneRandom(patientsDummyJson[0].ecpRelation),
    }));
};

const generatePatient = (count) => {
  const patients = getPatients(count);
  fs.writeFileSync('./json/patients.json', JSON.stringify(patients));
  console.log('Successfully created', patients.length, 'patients.');
};

module.exports = generatePatient;
