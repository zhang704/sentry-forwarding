var express = require("express");
var app = express();
var router = express.Router();
var request = require('request');
var bodyParser = require('body-parser');
var { sentry } = require("./config");

// 请求体解析中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.post('/*', function (req, res, next) {
  var url = `https://${sentry.port}.ingest.sentry.io${req.originalUrl}`;
  request({
    method: "POST",
    url,
    form: Buffer.from(JSON.stringify(req.body)).toString("base64"),
    headers: {
      "content-Type": "application/json"
    },
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var data = JSON.parse(body);
      res.send(data);
    } else {
      res.send('{ error: 404 }');
    }
  })
});

app.use('/', router);

module.exports = app;