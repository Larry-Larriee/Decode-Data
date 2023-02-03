// =============================================================================================================================
// VARIABLES

const {MongoClient} = require('mongodb');
require('dotenv').config();

const uri = process.env.DATABASE_URI;

// =============================================================================================================================
// MAINSETUP
 
// The IATDATA class connects to mongoDB and allows us to interact with the database
// Collection = the collection we want to interact with (Student or Teacher)
// Grade = the grade we want to interact with (3-12)
// Section = the section we want to interact with (1-8)
class IATDATA{
    constructor(collection, grade=0, section=0){
        // Use uri to connect to the database
        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); // (Second Argument) = prevent any warnings we get from mongoDB

        this.grade = grade;
        this.section = section;

        // Example. "Teacher" collection
        this.database = "IAT-Data";
        this.collection = collection;
    }

    async getData(){

        try{
            this.client.connect();

            const db = this.client.db(this.database);
            const collection = db.collection(this.collection);

            const dataArray = await collection.find({"data.grade": this.grade}).toArray();
            console.log(dataArray);
            console.log(dataArray.length);
            

        }
        catch(err){
            console.log(err);
        }
        finally{
            this.client.close();
        }
    }

    async getTestData(){

        try{
            this.client.connect();

            const db = this.client.db(this.database);
            const collection = db.collection(this.collection);

            const dataArray = await collection.find({}).toArray();
            // console.log(dataArray);

            let gradeLevels = [];
            for (let i = 0; i < dataArray.length; i += 1){
                let userTestData = dataArray[i].data.data;    
                
                console.log(userTestData);
            }

            
        }
        catch (err){
            console.log("Ran into an error: " + err);
        }
        finally{
            await this.client.close();
        }
    }

}

// =============================================================================================================================
// MAINSETUP

let iatTeacher = new IATDATA('Teacher', 12);
let iatStudent = new IATDATA('Student', 6);

iatStudent.getData();

// =============================================================================================================================

// To Do: get the mean of each grade and base it on section (odd sections are positive and even sections are negative)
// Do this for both students 