const config = require('./config.json');
const express = require('express');
const bodyParser = require('body-parser');
const Engine = require('./engine');

module.exports = class Handler {
  constructor() {
    this.server = express();
    this.engine = new Engine();
    this.server.use(bodyParser.json());
    this.init();
    this.server.listen(config.RosCOMM.port, () => {
      console.log(`RosCOMM API listening on port ${config.RosCOMM.port}`);
    });
  }

  init() {
    this.server.get('/ping', (req, res) => {
      res.json({
        result: 'pong',
      });
    });

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
          console.log(err.message);
          response.status(500).send(err.message);
        });
    });
  }
};
