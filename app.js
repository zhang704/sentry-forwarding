var express = require("express");
var app = express();
var router = express.Router();
var request = require('request');
var bodyParser = require('body-parser');
var { sentry } = require("./config");

// 请求体解析中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.get('/', function (req, res, next) {
  res.send("只有憨憨才能看到的首页信息～～～");
});

router.post(`/api/${sentry.id}/store`, function (req, res, next) {
  var url = `https://o511770.ingest.sentry.io${req.originalUrl}`;
  request({
    method: 'POST',
    url,
    form: Buffer.from(JSON.stringify(req.body)).toString('base64'),
    headers: {
      'content-Type': 'application/json'
    },
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var data = JSON.parse(body);
      res.send(data);
    } else {
      res.send({ code: -1, errMsg: '接口访问出错啦！' });
    }
  })
});

router.post("/api/getSentryData", function (req, res, next) {
  var { organization_slug = '', project_slug = '' } = req.body;
  var url = `https://sentry.io/api/0/projects/${organization_slug}/${project_slug}/events/`;
  request({
    method: 'GET',
    url,
    headers: {
      "Authorization": `Bearer ${sentry.authToken}`
    },
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      try {
        var data = JSON.parse(body);
        data.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
        res.send(data[0]);
      } catch (error) {
        res.send({ code: -1, errMsg: '出错啦！' })
      }
    } else {
      res.send({ code: -1, errMsg: '接口访问出错啦！' });
    }
  })
})

router.get('/api/ip', function (req, res, next) {
  const ip = req.ip.match(/\d+\.\d+\.\d+\.\d+/)[0];
  res.send({ code: 0, data: { ip } });
})

app.use('/', router);

module.exports = app;