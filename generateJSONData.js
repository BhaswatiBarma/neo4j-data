const fs = require('fs');
const { parse } = require('csv-parse/sync');
const generatePerson = require('./getPersons');
const generateDoctor = require('./getDoctors');
const generatePatient = require('./getPatients');
const generateComplaint = require('./getComplaints');
const generateHistory = require('./getHistories');
const generateAllergyHistory = require('./getAllergyhistories');
const generateTreatmentEpisode = require('./getTreatmentepisodes');
const generateVisit = require('./getVisits');
const deleteAllFilesInDir = require('./fsUtils');

const CHUNK_SIZE = 1000;

const getKeyAndFolder = (startCount) => {

  const key = `${startCount}-${startCount + CHUNK_SIZE}`;
  const folder = `./csv/${key}/`;

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  return { key, folder };
};

const generateAllData = async (count) => {
  if (!fs.existsSync('./csv')) {
    fs.mkdirSync('./csv');
  }
  // await deleteAllFilesInDir('./csv');

  if (count > CHUNK_SIZE) {
    for (let start = 0; start < count; start += CHUNK_SIZE) {
      if (start + CHUNK_SIZE > count) {
        await generateChunk(start, count);
      } else {
        await generateChunk(start, start + CHUNK_SIZE);
      }
    }
  } else {
    await generateChunk(0, count);
  }
};

let prevKey = '';

const generateChunk = async (startCount, endCount) => {
  const { key, folder } = getKeyAndFolder(startCount);

  const statFile = './stats.json';
  let stats = {};
  try {
    stats = JSON.parse(fs.readFileSync(statFile).toString());
  } catch (_) {
    console.log('No stats found');
  }

  const personCount = await generatePerson(startCount, endCount, folder);
  const doctorsCount = await generateDoctor(
    folder,
    stats[prevKey]?.doctors.count || 0
  );
  const patientsCount = await generatePatient(
    folder,
    stats[prevKey]?.patients.count || 0
  );
  const complaintsCount = await generateComplaint(
    folder,
    stats[prevKey]?.complaints.count || 0
  );
  const historiesCount = await generateHistory(
    folder,
    stats[prevKey]?.histories.count || 0
  );
  const allergyhistoriesCount = await generateAllergyHistory(
    folder,
    stats[prevKey]?.allergyhistories.count || 0
  );
  const treatmentEpisodesCount = await generateTreatmentEpisode(
    folder,
    stats[prevKey]?.treatmentEpisodes.count || 0
  );
  const visitsCount = await generateVisit(folder, stats[prevKey]?.visits.count || 0);

  const personsSize = fs.statSync(`${folder}persons.csv`);
  const doctorsSize = fs.statSync(`${folder}doctors.csv`);
  const patientsSize = fs.statSync(`${folder}patients.csv`);
  const complaintsSize = fs.statSync(`${folder}complaints.csv`);
  const historiesSize = fs.statSync(`${folder}histories.csv`);
  const allergyhistoriesSize = fs.statSync(`${folder}allergyhistories.csv`);
  const treatmentEpisodesSize = fs.statSync(`${folder}treatmentEpisodes.csv`);
  const visitsSize = fs.statSync(`${folder}visits.csv`);

  stats[key] = {
    persons: {size: personsSize.size/1024, count: personCount},
    doctors: {size: doctorsSize.size/1024, count: (stats[prevKey]?.doctors.count || 0) + doctorsCount},
    patients: {size: patientsSize.size/1024, count: (stats[prevKey]?.patients.count || 0) + patientsCount},
    complaints: {size: complaintsSize.size/1024, count: (stats[prevKey]?.complaints.count || 0) + complaintsCount},
    histories: {size: historiesSize.size/1024, count: (stats[prevKey]?.histories.count || 0) + historiesCount},
    allergyhistories: {size: allergyhistoriesSize.size/1024, count: (stats[prevKey]?.allergyhistories.count || 0) + allergyhistoriesCount},
    treatmentEpisodes: {size: treatmentEpisodesSize.size/1024, count: (stats[prevKey]?.treatmentEpisodes.count || 0) + treatmentEpisodesCount},
    visits: {size: visitsSize.size/1024, count: (stats[prevKey]?.visits.count || 0) + visitsCount},
  };

  fs.writeFileSync(statFile, JSON.stringify(stats));

  prevKey = key;

  return `${endCount}\t${doctorsCount}\t${patientsCount}\t${complaintsCount}\t${historiesCount}\t${allergyhistoriesCount}\t${treatmentEpisodesCount}\t${visitsCount}\t${
    personsSize.size / 1024
  }\t${doctorsSize.size / 1024}\t${patientsSize.size / 1024}\t${
    historiesSize.size / 1024
  }\t${allergyhistoriesSize.size / 1024}\t${complaintsSize.size / 1024}\t${
    treatmentEpisodesSize.size / 1024
  }\t${visitsSize.size / 1024}`;
};

module.exports = { generateAllData, getKeyAndFolder, CHUNK_SIZE };
