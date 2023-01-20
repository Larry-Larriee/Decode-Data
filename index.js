// =============================================================================================================================
// VARIABLES

const {MongoClient} = require('mongodb');
require('dotenv').config();

const uri = process.env.DATABASE_URI;

// =============================================================================================================================
// MAINSETUP
 
class IATDATA{
    constructor(collection, grade){
        // Use uri to connect to the database
        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); // (Second Argument) = prevent any warnings we get from mongoDB

        this.grade = grade;

        // Example. "Teacher" collection
        this.database = "IAT-Data";
        this.collection = collection;
    }

    // purgeData method removes everything from the specified collection
    // BE CAREFUL WITH THIS METHOD
    async purgeData(){
        try{
            await this.client.connect();
    
            let db = this.client.db(this.database); 
            let collection = db.collection(this.collection);
    
            await collection.deleteMany({});
            console.log("Data Sucessfully Purged");
        }
        catch (err){
            console.log("Ran into an error: " + err);
        }
        finally{
            await this.client.close();
        }
    }

    async getGrade(){
        try{
            await this.client.connect();
    
            let db = this.client.db(this.database); 
            let collection = db.collection(this.collection);
    
            const collectionData = await collection.find({"data.grade": this.grade}).toArray();
            console.log(collectionData);
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

let iatTeacher = new IATDATA('Teacher',12);
let iatStudent = new IATDATA('Student', 6);

iatStudent.reformatData();