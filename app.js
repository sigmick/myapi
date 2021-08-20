const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const { authRoutes } = require('./routes');

const MONGODB_URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-shard-00-00.uun6y.mongodb.net:27017,cluster0-shard-00-01.uun6y.mongodb.net:27017,cluster0-shard-00-02.uun6y.mongodb.net:27017/${process.env.MONGO_DEFAULT_DATABASE}?ssl=true&replicaSet=atlas-wtrj82-shard-0&authSource=admin&retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json()); // application/json

app.use('/auth', authRoutes);

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
