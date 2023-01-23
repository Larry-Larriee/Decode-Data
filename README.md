### Purpose 

The repository is created to display and analyze data given from the OCSEF-IAT Exam. As of 1/23/2023, this exam has been taken by 381 students, 7 teachers. 

**https://ocsef-iat.github.io/**
### Analysis 

The data is analyzed by taking data from MongoDB using Node.js. The methods of the data are displayed below:

querySpeed() - returns the average time that a student or teacher takes to answer the prompt in the given section
- {this.grade} = the grade we want to query
- {this.section} = the section we want to query

purgeData() - removes everything from the specified collection {BE CAREFUL WITH THIS METHOD}

```json
We can extract data from mongoDB using the find() method.
- Ex. const dataArray = await collection.find({"data.grade": {$gte: this.grade}}).toArray();

using .toArray() will return an array of Javascript objects that we can use to analyze the data.
```