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

    // correctness method returns the correctness of the grade given what their response was for the prompt
    async queryCorrectness(){

    }

    // querySpeed returns the average time that a student or teacher takes to answer the prompt in the given section
    // {this.grade} = the grade we want to query
    // {this.section} = the section we want to query
    async querySpeed(){
        try{
            await this.client.connect();
            let collection = this.client.db(this.database).collection(this.collection);
            const dataArray = await collection.find({"data.grade": this.grade}).toArray();

            // All times for the section will be stored in this array to find the mean 
            const timeArray = [];

            for (let i = 0; i < dataArray.length; i+= 1){
                let userData = dataArray[i].data;
                let userDataTimedIAT = userData.data;

                console.log(userData.relationship, userData.grade, userData.classesAdvanced);
                
                for (let index = 0; index < userDataTimedIAT.length; index += 1){
                    // console.log(userDataTimedIAT[index]);

                    for (let j = 0; j < userDataTimedIAT[index].length; j += 1){
                        // console.log(userDataTimedIAT[index][j], typeof userDataTimedIAT[index][j]);

                        if (userDataTimedIAT[index][j] === this.section){
                            timeArray.push(userDataTimedIAT[index][1]);
                        }
                    }
                }
            }

            let timedMean = getMean(timeArray);
            console.log(timeArray);
            console.log(timedMean);
        }
        catch (err){
            console.log("Ran into an error: " + err);
        }
        finally{
            await this.client.close();
        }
    }
}

function getMean(array){
    let sum = 0;

    for (let i = 0; i < array.length; i += 1){
        sum += array[i];
    }
    return sum / array.length;
}

// =============================================================================================================================
// MAINSETUP

let iatTeacher = new IATDATA('Teacher', 7, 1);
let iatStudent = new IATDATA('Student', 10, 5);

iatStudent.querySpeed();