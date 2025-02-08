const sdk = require("node-appwrite");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { count } = require("console");

let client = new sdk.Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6648c699000032e4623c")
  .setKey(
    "standard_78baabe8590f6f9977be43f25f4c5d863a389c39011e4d84a1e4a0269ca51d17a5aa73ab03d904e28039955b42fc00374b1d717b3924f4d9ffd20b572301a5f4dd7100e611eb00b83067e370c1818ece4839605fa27fe784ba5acf76c36518ed08e04c032e9ef365e4180d0e81f0a1005b168f25de52a7d960b4cceb1b296f25",
  )
  .setSelfSigned(); // Use only on dev mode with a self-signed SSL cert

const databases = new sdk.Databases(client);

const DATABASEID = "66502c6e0015d7be8526";
const MEMBERCOLLECTIONID = "6797ac980023a75b2c98";
const FORMCOLLECTIONID = "6797ac8d0014b3e0354a";

const FORMDATA = [
  {
    division: "Test division",
    ward: "Test ward",
    area: "Test area",
  },
];

const MEMBERDATA = [
  {
    fnam_eng: "Test fname",
  },
];

async function getSurvey() {
  var survey = await databases.listDocuments(DATABASEID, FORMCOLLECTIONID);

  survey.documents.forEach((survey) => {
    console.log(`${survey.division}`);
  });
}

async function getRelationshipSurvey() {
  try {
    var surveyForms = await databases.listDocuments(
      DATABASEID,
      FORMCOLLECTIONID,
    );

    let surveyFormId = surveyForms.documents[0].$id;
    console.log(surveyFormId);

    var relatedMember = await databases.listDocuments(
      DATABASEID,
      MEMBERCOLLECTIONID,
      [sdk.Query.equal("form", surveyFormId)],
    );
    console.log(relatedMember.documents);
  } catch (error) {
    console.error(`You have error: ${error}`);
  }
}

async function uploadData() {
  try {
    //using object
    //const filedata = DATA;

    // using json
    // const filePath = path.join(__dirname, "data.json");
    // const filedata = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // using excel
    const filePath = path.join(__dirname, "test.xlsx");
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const fileData = XLSX.utils.sheet_to_json(worksheet);

    for (const item of fileData) {
      const docs = await databases.createDocument(
        DATABASEID,
        FORMCOLLECTIONID,
        sdk.ID.unique(),
        item,
      );
      console.log("Document created:", docs);
    }
  } catch (err) {
    console.log(`${err}`);
  }
}

async function uploadDataWithRelationship() {
  // create doc in form and with doc id create entry in members
  try {
    const docs = await databases.createDocument(
      DATABASEID,
      FORMCOLLECTIONID,
      sdk.ID.unique(),
      FORMDATA,
    );
    console.log(`Document created!,${docs}`);

    // for (const item of docs) {
    try {
      const docs = await databases.createDocument(
        DATABASEID,
        MEMBERCOLLECTIONID,
        //item.$id,
        sdk.ID.unique(),
        MEMBERDATA,
      );
      console.log(`document created, ${docs}`);
    } catch (err) {
      console.log(`err creating second doc ${err}`);
    }
    //}
  } catch (err) {
    console.log(`err creating first doc ${err}`);
  }
}

async function uploadDataWithRelationship() {
  try {
    // Iterate over each form data item
    for (let i = 0; i < FORMDATA.length; i++) {
      const formDataItem = FORMDATA[i];

      // Create the form document
      const formDoc = await databases.createDocument(
        DATABASEID,
        FORMCOLLECTIONID,
        sdk.ID.unique(),
        formDataItem,
      );

      console.log(`Form document ${i + 1} created: ${formDoc.$id}`);

      // Prepare member documents with the relationship to the form
      const memberDocuments = MEMBERDATA.map((memberDataItem) => ({
        ...memberDataItem,
        form: formDoc.$id,
      }));

      // Create all member documents concurrently
      const memberDocs = await Promise.all(
        memberDocuments.map((memberData) =>
          databases.createDocument(
            DATABASEID,
            MEMBERCOLLECTIONID,
            sdk.ID.unique(),
            memberData,
          ),
        ),
      );

      console.log(
        `Member documents created for form ${formDoc.$id}:`,
        memberDocs.map((doc) => doc.$id),
      );
    }
  } catch (err) {
    console.error(`Error creating documents: ${err.message}`);
  }
}

async function uploadDataFromExcel() {
  try {
    const membersWorkbook = XLSX.readFile("final.xlsx");
    const membersSheet = membersWorkbook.Sheets["Sheet1"];
    const MEMBERDATA = XLSX.utils.sheet_to_json(membersSheet);

    for (const memberDataItem of MEMBERDATA) {
      // Iterate through each member
      const emptyForm = {
        // Create a new empty form for EACH member
        division: "",
        ward: "",
        area: "",
        building: "",
        is_room_locked: false,
        is_room_rented: false,
        survey_denied: false,
        room_number: "",
      };

      const formDoc = await databases.createDocument(
        DATABASEID,
        FORMCOLLECTIONID,
        sdk.ID.unique(),
        emptyForm,
      );

      console.log(`Empty form document created: ${formDoc.$id}`);

      const memberData = { ...memberDataItem }; // Copy member data

      // Convert number fields to strings (as before)
      for (const key in memberData) {
        if (typeof memberData[key] === "number") {
          memberData[key] = String(memberData[key]);
        }
      }

      const memberDoc = await databases.createDocument(
        // Create member linked to THIS form
        DATABASEID,
        MEMBERCOLLECTIONID,
        sdk.ID.unique(),
        { ...memberData, form: formDoc.$id }, // Combine and link
      );

      console.log(
        `Member document created: ${memberDoc.$id} (linked to ${formDoc.$id})`,
      );
    } // End of member iteration
  } catch (err) {
    console.error(`Error creating documents: ${err}`);
  }
}

async function deleteAllDocuments() {
  try {
    let hasMore = true;

    while (hasMore) {
      const mainDocs = await databases.listDocuments(DATABASEID, FORMCOLLECTIONID);
      if (mainDocs.documents.length === 0) {
        hasMore = false;
        break;
      }

      // Delete related documents in parallel
      const deletePromises = mainDocs.documents.map(async (doc) => {
        const docId = doc.$id;

        // Fetch related documents
        const relatedDocs = await databases.listDocuments(DATABASEID, MEMBERCOLLECTIONID, [
          sdk.Query.equal('form', docId)
        ]);

        // Delete related documents in parallel
        const deleteRelatedPromises = relatedDocs.documents.map(relatedDoc =>
          databases.deleteDocument(DATABASEID, MEMBERCOLLECTIONID, relatedDoc.$id)
        );

        await Promise.all(deleteRelatedPromises);

        // Delete the main document
        await databases.deleteDocument(DATABASEID, FORMCOLLECTIONID, docId);
      });

      // Wait for all deletions to complete
      await Promise.all(deletePromises);
    }

    console.log("All documents and related documents deleted successfully!");
  } catch (error) {
    console.error(`Error deleting documents: ${error.message}`);
  }
}


async function countDocument() {
  let count = 0;
  try {
    result = await databases.listDocuments(
      DATABASEID,
      MEMBERCOLLECTIONID,
    );
    count = result.total;
    console.log(`${count} document fetched!`)
  } catch (error) {
    console.log(`Error deleting doc ${error}`)
  }
}

async function runTasks() {
  await countDocument();
  // setTimeout(runTasks, 5000);
}

runTasks();
