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

                            // if the user has more than or equal to 32 questions incorrect, add them to the blacklist
                            if (userCorrectness <= -25){
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

    // get the mean time of each grade based on positive or negative section (odd sections are positive and even sections are negative)
    async querySpeedWithSection(){
        
        try{
            this.client.connect();
            let collection = this.client.db(this.database).collection(this.collection);

            // Get whatever objects have this.grade in them. We use data.grade to get the key in the object
            const dataArray = await collection.find({"data.grade": this.grade}).toArray();
            const meanTime = { 
                positiveSection: 0,
                negativeSection: 0,

                allSections: 0
            }

            // const blackList = await this.queryCorrectness();
            // console.log(blackList);

            // for each user, get the time avergae time for positive and negative sections. Then divide by the number of users
            // which gets the the average time for each section for the entire grade
            for (let user = 0; user < dataArray.length; user += 1){
                const testDataArrays = dataArray[user].data.data;
                let timePositiveSection = 0;
                let timeNegativeSection = 0;
                let timeAllSections = 0;

                // for each test question the user answers 
                for (let j = 0; j < testDataArrays.length; j += 1){
                    
                    const section = testDataArrays[j][0];
                    const time = testDataArrays[j][1];

                    if (section % 2 === 0){
                        timePositiveSection += time;
                    }
                    else{
                        timeNegativeSection += time;
                    }

                    timeAllSections += time;
                    // console.log("time: " + time);
                }

                // We divide by 32 because there are 4 sections (with 8 questions each) for both positive and negative 
                // Getting the mean of each indivdual user 
                meanTime.positiveSection += (timePositiveSection / 32);
                meanTime.negativeSection += (timeNegativeSection / 32);

                meanTime.allSections += (timeAllSections / 64);
            }

            // Getting the mean of the entire grade
            meanTime.positiveSection /= dataArray.length;
            meanTime.negativeSection /= dataArray.length;

            meanTime.allSections /= dataArray.length;

            console.log(`Average time for grade ${this.grade} for positive section: ${meanTime.positiveSection}`);
            console.log(`Average time for grade ${this.grade} for negative section: ${meanTime.negativeSection}`);
            console.log(`Average time for grade ${this.grade} for all sections: ${meanTime.allSections}`);
        }
        catch (err){
            console.log("Ran into an error: " + err);
        } 
        finally{
            this.client.close(); 
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

// =============================================================================================================================
// MAINSETUP

let iatTeacher = new IATDATA('Teacher', 12);
let iatStudent = new IATDATA('Student', 12);

iatStudent.querySpeedWithSection();

// =============================================================================================================================

// To Do: get the mean of each grade and base it on section (odd sections are positive and even sections are negative)
// Do this for both students and teachers