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

    // Return the _id of the user that has more than half of their responses incorrect
    // we can look inside blacklisted id's through 
    // collection.find({"_id": {$in: blackListById}}).toArray() where blackListById is an array of _id's
    async queryCorrectness(){
        const blackListById = [];

        try{
            await this.client.connect(); 
            let db = this.client.db(this.database);
            let collection = db.collection(this.collection);

            const iatAnalysis = {
                response: {
                    e: false,
                    i: true
                },
                prompt: {
                    teacher: {
                        positiveTerms: ["Motivated", "Studious", "Competent", "Collaborative"],
                        negativeTerms: ["Disruptive", "Lazy", "Cheaters", "Irresponsible"]
                    },
                    student: {
                        positiveTerms: ["Joyful", "Happy", "Content", "Cheerful"],
                        negativeTerms: ["Miserable", "Sad", "Gloomy", "Depressed"]
                    }
                }
            }

            const dataArray = await collection.find({}).toArray();

            // Get teacher or student prompt using relationship
            const relationship = iatAnalysis.prompt[(this.collection).toLowerCase()];

            // Loop through all users
            for (let i = 0; i < dataArray.length; i += 1){
                let userId = dataArray[i]._id;
                let userCorrectness = 0;

                // Loop through individual user test data
                for (let j = 0; j < dataArray[i].data.data.length; j += 1){
                    
                    if (relationship.positiveTerms.includes(dataArray[i].data.data[j][3])){
                        if (!(dataArray[i].data.data[j][4] === "e")){
                            userCorrectness -= 1;

                            // if the user has more than 32 questions incorrect, add them to the blacklist
                            if (userCorrectness < -30){
                                blackListById.push(userId);
                                break;
                            }
                        }
                    }
                }
            }
            
            // console.log(blackListById);
        }  
        catch (err){
            console.log("Ran into an error: " + err);
        }
        finally{
            this.client.close();
        }

        return new Promise((resolve) => {
            resolve(blackListById);
        });
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

    // check if a certain grade exists. If it does, return all the grades that exist
    async queryByGrades(){

        try{
            await this.client.connect();
            let collection = this.client.db(this.database).collection(this.collection);
            
            const dataArray = await collection.find({}).toArray();
            // console.log(dataArray);

            let gradeLevels = [];
            for (let i = 0; i < dataArray.length; i += 1){
                let grade = dataArray[i].data.grade;
                gradeLevels.push(dataArray[i].data.grade);
            }

            console.log(`${this.collection} grade levels: ${removeRepititions(gradeLevels)}`);
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

function removeRepititions(array){
    let returnArray = [];

    array.forEach((element) => {
        if (!returnArray.includes(element)){
            returnArray.push(element);
        }
    });

    return returnArray;
}

// this function is need to get the blackListById array due to the asynchronous nature of the queryCorrectness function
// reassigns blackList to the set of _id's that are blacklisted
async function fetchCorrectness(objectName){
    blackList = await objectName.queryCorrectness();

    console.log(blackList);
}

// =============================================================================================================================
// MAINSETUP

let blackList = [];

let iatTeacher = new IATDATA('Teacher', 7, 1);
let iatStudent = new IATDATA('Student', 10, 5);

fetchCorrectness(iatTeacher);

// if I were to console log fetchCorrectness(iatTeacher) here, I would be getting it instantaneously instead of awaiting 
// the queryCorrectness function to finish

// console.log(blackList);

// =============================================================================================================================

// To Do: get the mean of each grade and base it on section (odd sections are positive and even sections are negative)
// Do this for both students and teachers