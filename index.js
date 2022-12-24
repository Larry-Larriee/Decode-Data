// =============================================================================================================================
// VARIABLES

const {MongoClient} = require('mongodb');
require('dotenv').config();

const uri = process.env.DATABASE_URI;

// =============================================================================================================================
// MAINSETUP

async function reformatData(){
    // Use uri to connect to the database
    let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); // (Second Argument) = prevent any warnings we get from mongoDB

    try {
        await client.connect();
    
        // Retrieve data from the Teacher and Student collections
        let db = client.db('IAT-Data');
        let teacher = db.collection('Teacher');
        let student = db.collection('Student');

        const teacherData = await teacher.find({}).toArray();
        console.log(teacherData);
    }
    catch (err) {
        console.log("Ran into an error: " + err);
    }
    finally {
        await client.close();
    }
}

reformatData();