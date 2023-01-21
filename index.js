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

        // Example. "Teacher" collection
        this.database = "IAT-Data";
        this.collection = collection;
    }

    // purgeData method removes everything from the specified collection {BE CAREFUL WITH THIS METHOD}
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

    // getGrade method returns all the data from the specified collection and grade
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

// iatStudent.getGrade();