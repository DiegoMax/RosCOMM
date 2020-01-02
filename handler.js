//const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const Engine = require('./engine');

module.exports = class Handler {
  constructor() {
    console.log('Request handler has been initialized!');
    this.server = express();
    this.engine = new Engine();
    this.server.use(bodyParser.json());
    this.init();
    this.server.listen(4000, () => {
      console.log('RosUNMS API listening on port 4000');
    });
  }

  init() {
    this.server.post('/set_suspension', ({ body }, response) => {
      const { changeType, extraData, entityId } = body;
      let changePromise;
      switch (changeType) {
        case 'suspend':
          changePromise = this.engine.suspendService(extraData);
          break;
        case 'unsuspend':
          changePromise = this.engine.unsuspendService(extraData);
          break;
      }
      changePromise
        .then(res => {
          response.json(res);
        })
        .catch(err => {
          res.status(500).json(err);
        });
    });
  }
};
