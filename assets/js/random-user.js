// --- Random User Generator Data ---

const firstNamesMale = [
  "James", "Oliver", "Ethan", "Liam", "Noah",
  "William", "Henry", "Jack", "Alexander", "Samuel",
  "Lucas", "Benjamin", "Thomas", "Daniel", "Jacob",
  "Logan", "Matthew", "Joseph", "Oscar", "Leo"
];

const firstNamesFemale = [
  "Emily", "Olivia", "Sophia", "Isabella", "Ava",
  "Mia", "Charlotte", "Amelia", "Ella", "Grace",
  "Lily", "Chloe", "Evie", "Ruby", "Zoe",
  "Hannah", "Lucy", "Aria", "Sienna", "Isla"
];

const lastNames = [
  "Smith", "Johnson", "Brown", "Taylor", "Williams",
  "Jones", "Davies", "Miller", "Wilson", "Moore",
  "Anderson", "Clark", "Thompson", "White", "Harris",
  "Lewis", "Robinson", "Walker", "Hall", "Young",
  "King", "Wright", "Scott", "Green", "Baker",
  "Adams", "Nelson", "Carter", "Mitchell", "Morgan",
  "Cooper", "Reed", "Bell", "Wood", "Ward",
  "Turner", "Parker", "Cook", "Stewart", "Morris"
];

// Each entry: { city, country }
const cityCountryPairs = [
  { city: "London", country: "United Kingdom" },
  { city: "Manchester", country: "United Kingdom" },
  { city: "Birmingham", country: "United Kingdom" },
  { city: "Leeds", country: "United Kingdom" },
  { city: "Liverpool", country: "United Kingdom" },
  { city: "New York", country: "United States" },
  { city: "San Francisco", country: "United States" },
  { city: "Los Angeles", country: "United States" },
  { city: "Chicago", country: "United States" },
  { city: "Boston", country: "United States" },
  { city: "Paris", country: "France" },
  { city: "Berlin", country: "Germany" },
  { city: "Rome", country: "Italy" },
  { city: "Madrid", country: "Spain" },
  { city: "Amsterdam", country: "Netherlands" },
  { city: "Dublin", country: "Ireland" },
  { city: "Edinburgh", country: "United Kingdom" },
  { city: "Toronto", country: "Canada" },
  { city: "Vancouver", country: "Canada" },
  { city: "Sydney", country: "Australia" }
];


function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFakeData(fields) {

  // Read the selected gender
  const genderOption = document.querySelector('input[name="genderOption"]:checked').value;

  // Select name set based on gender
  let gender;
  let firstName;

  if (genderOption === "male") {
    gender = "male";
    firstName = firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)];
  } else if (genderOption === "female") {
    gender = "female";
    firstName = firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
  } else {
    // random gender
    gender = Math.random() < 0.5 ? "male" : "female";
    firstName = gender === "male"
      ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]
      : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
  }

  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const location = cityCountryPairs[Math.floor(Math.random() * cityCountryPairs.length)];




  const data = {};
  for (const field of fields) {
    switch (field) {
      case "firstName":
        data[field] = firstName;
        break;
      case "lastName":
        data[field] = lastName;
        break;
      case "email":
        data[field] = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
        break;
      case "username":
        data[field] = `${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;
        break;
      case "password":
        data[field] = Math.random().toString(36).slice(-8);
        break;
      case "age":
        data[field] = Math.floor(Math.random() * 60) + 18;
        break;
      case "city":
        data[field] = location.city;
        break;
      case "country":
        data[field] = location.country;
        break;
      case "phone":
        data[field] = "+44" + Math.floor(Math.random() * 900000000 + 100000000);
        break;
      case "gender":
        data[field] = gender;
        break;
      default:
        data[field] = Math.random().toString(36).substring(2, 8);
    }
  }
  return data;
}

function convertToCSV(data, delimiter = ",") {
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => headers.map(h => obj[h]).join(delimiter));
  return [headers.join(delimiter), ...rows].join("\n");
}

document.getElementById("generateBtn").addEventListener("click", () => {
  const selected = Array.from(document.querySelectorAll('input[name="fields"]:checked')).map(i => i.value);
  const customs = Array.from(document.querySelectorAll('.customField')).map(f => f.value.trim()).filter(Boolean);
  const fields = [...selected, ...customs];
  const count = parseInt(document.getElementById("recordCount").value) || 1;
  const format = document.getElementById("outputFormat").value;

  if (fields.length === 0) {
    alert("Please select or enter at least one field.");
    return;
  }

  const records = Array.from({ length: count }, () => generateFakeData(fields));

  let output;
  if (format === "json") {
    output = JSON.stringify(records, null, 2);
  } else if (format === "csv") {
    output = convertToCSV(records, ",");
  } else {
    output = convertToCSV(records, "\t");
  }

  document.getElementById("output").value = output;
});

document.getElementById("copyBtn").addEventListener("click", () => {
  const output = document.getElementById("output");
  output.select();
  document.execCommand("copy");
  alert("Copied to clipboard!");
});