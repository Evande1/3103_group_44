const express = require('express');
const mongoose = require('mongoose');

const app = express();
const cors = require('cors');
const port = 3030;
const { v4: uuidv4 } = require('uuid');
const Click = require('./models');
const path = require('path');

// connect to mongodb
mongoose.connect(
  'mongodb+srv://3103:RBm2TluHJL2X8V2B@3103.4rmps.mongodb.net/clicks?retryWrites=true&w=majority&appName=3103/',
);
// mongodb+srv://3103:RBm2TluHJL2X8V2B@3103.4rmps.mongodb.net/?retryWrites=true&w=majority&appName=3103

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// track click
app.get('/track', async (req, res) => {
  const userId = req.query.userId || uuidv4(); // Either get userId from query or generate a new one
  // const params = JSON.stringify(req.query);     // Convert the query parameters to a string for storage
  const jobId = req.query.jobId;
  try {
    // Check if there is already a click from this user with the same params
    const existingClick = await Click.findOne({ userId, jobId });

    if (existingClick) {
      res
        .status(200)
        .send(
          `User ${userId} has already clicked this link with these parameters.`
        );
    } else {
      // Store the click data in MongoDB if no existing record is found
      const click = new Click({ userId, jobId });
      await click.save();
      res.status(200).send(`Click tracked for user: ${userId}`);
    }
  } catch (err) {
    res.status(500).send(`Error tracking click: ${err}`);
  }
  // Serve the image immediately after tracking
  
});

// get image
app.use('/images', express.static('images'));

app.get('/stats/all', async (req, res) => {
    const clicks = await Click.find({}); // return the whole list
    res.send({
      clicks: clicks
    });
});

// get clicks for job
app.get('/stats', async (req, res) => {
  const clicksForJob = await Click.find({ jobId: req.query.jobId }); 
  res.send({
    jobId: req.query.jobId,
    clicks: clicksForJob.length,
  });
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
