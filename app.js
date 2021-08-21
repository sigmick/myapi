require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const firebase = require('./firebase');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const sharp = require('sharp');
const csv = require('csvtojson');

const { authRoutes } = require('./routes');

const MONGODB_URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-shard-00-00.uun6y.mongodb.net:27017,cluster0-shard-00-01.uun6y.mongodb.net:27017,cluster0-shard-00-02.uun6y.mongodb.net:27017/${process.env.MONGO_DEFAULT_DATABASE}?ssl=true&replicaSet=atlas-wtrj82-shard-0&authSource=admin&retryWrites=true&w=majority`;

// upload setup
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
});

const csvupload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .csv format allowed!'));
    }
  },
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // application/json

app.use('/auth', authRoutes);

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).send('Error: No files found');
  } else {
    const buff = await sharp(req.file.buffer)
      .resize({ width: 200 })
      .png()
      .toBuffer();

    const blob = firebase.bucket.file('profile/' + uuidv4() + '.' + 'png');
    // const blob = firebase.bucket.file(
    //   'profile/' + uuidv4() + '.' + mime.extension(req.file.mimetype)
    // );

    const blobWriter = blob.createWriteStream({
      metadata: {
        contentType: 'image/png',
      },
    });
    // const blobWriter = blob.createWriteStream({
    //   metadata: {
    //     contentType: req.file.mimetype,
    //   },
    // });

    blobWriter.on('error', (err) => {
      console.log(err);
    });

    blobWriter.on('finish', () => {
      res.status(200).send('File uploaded.');
    });

    blobWriter.end(buff);
    // blobWriter.end(req.file.buffer);
  }
});

app.post('/csvtojson', csvupload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).send('Error: No files found');
  } else {
    const jsonArray = await csv().fromString(req.file.buffer.toString());
    res.status(200).send(jsonArray);
  }
});

app.get('/profile/img/:id', (req, res) => {
  const file = firebase.bucket.file('profile/' + req.params.id);
  file.download().then((downloadres) => {
    res.status(200).send(downloadres[0]);
  });
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
