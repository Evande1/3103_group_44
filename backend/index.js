const express = require('express');
const mongoose = require('mongoose');

const app = express();
const cors = require('cors');
const port = 3030;
const { Jobs, Departments } = require('./models');
const path = require('path');

// connect to mongodb
mongoose.connect(
  'mongodb+srv://3103:RBm2TluHJL2X8V2B@3103.4rmps.mongodb.net/mailing?retryWrites=true&w=majority&appName=3103/'
);
// mongodb+srv://3103:RBm2TluHJL2X8V2B@3103.4rmps.mongodb.net/?retryWrites=true&w=majority&appName=3103

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// get image
app.use('/images', express.static('images'));

// track viewing
app.get('/image.png', async (req, res) => {
  const userId = req.query.userId; // Either get userId from query or generate a new one
  const jobId = req.query.jobId;

  console.log('userId:', userId);
  console.log('jobId:', jobId);
  try {
    // Check if there is already a click from this user with the same params
    const user = await Departments.findOne({ email: userId, jobId });

    if (!user) {
      // Store the click data in MongoDB if no existing record is found
      console.log('error no user found');
    } else {
      await Departments.updateOne(
        { email: userId, jobId },
        { $set: { hasRead: true } }
      );
      console.log(`User ${userId} clicked the link with jobId ${jobId}`);
      // might need to redo this in the future
      res.sendFile(path.join(__dirname, 'images/download.png'));
    }
  } catch (error) {
    console.error('Failed to track click:', error);
    res.status(500).send('Failed to track click');
  }
});

// create jobs (mass email feature)
app.post('/jobs', async (req, res) => {
  const { id, departmentCode, totalCount } = req.body;
  console.log(req.body);
  date = new Date();
  const job = new Jobs({ id, departmentCode, date, totalCount });
  await job.save();
  res.send(job);
});

// create departments (add try catch later)
app.post('/departments', async (req, res) => {
  const { emailList, departmentCode, jobId } = req.body;
  const departments = await Promise.all(
    emailList.map(async (email) => {
      const department = new Departments({
        email,
        hasRead: false,
        departmentCode,
        jobId,
      });
      return department.save(); // Save each department document
    })
  );

  res.status(200).send(`Created ${departments.length} departments`);
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// nic can try later
// {id, dept, filename, viewcount, total} ->
// {id : count }
// app.get('/stats/all', async (req, res) => {
//   const clicks = await Click.find({}); // return the whole list
//   res.send({
//     clicks: clicks,
//   });
// });

// get clicks for job
// app.get('/stats', async (req, res) => {
//   const clicksForJob = await Click.find({ jobId: req.query.jobId });
//   res.send({
//     jobId: req.query.jobId,
//     clicks: clicksForJob.length,
//   });
// });
