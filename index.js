// =============================================================================================================================
// VARIABLES

const {MongoClient} = require('mongodb');
require('dotenv').config();

const uri = process.env.DATABASE_URI;

// =============================================================================================================================
// MAINSETUP
 
class IATDATA{
    constructor(database,collection){
        // Use uri to connect to the database
        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); // (Second Argument) = prevent any warnings we get from mongoDB

        this.database = database; // ex. "IAT-Data"
        this.collection = collection;  // ex. "Teacher"
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

    async reformatData(){
    
        try {
            await this.client.connect();
        
            let db = this.client.db('IAT-Data');
            let collection = db.collection(this.collection); 
    
            const collectionData = await collection.find({}).toArray();
            console.log(collectionData);
        }
        catch (err) {
            console.log("Ran into an error: " + err);
        }
        finally {
            await this.client.close();
        }
    }
}

// =============================================================================================================================
// MAINSETUP

let iatData = new IATDATA('IAT-Data','Student');

// iatData.purgeData();