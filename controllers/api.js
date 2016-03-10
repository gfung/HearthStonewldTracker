var _ = require('lodash');
var async = require('async');

/**
 * Split into declaration and initialization for better startup performance.
 */
var validator;
var cheerio;
var request;

/**
 * GET /api
 * List of API examples.
 */
exports.getApi = function(req, res) {
  res.render('api/index', {
    title: 'API Examples'
  });
};

/**
 * GET /api/facebook
 * Facebook API example.
 */
exports.getFacebook = function(req, res, next) {
  graph = require('fbgraph');

  var token = _.find(req.user.tokens, { kind: 'facebook' });
  graph.setAccessToken(token.accessToken);
  async.parallel({
    getMe: function(done) {
      graph.get(req.user.facebook + "?fields=id,name,email,first_name,last_name,gender,link,locale,timezone", function(err, me) {
        done(err, me);
      });
    },
    getMyFriends: function(done) {
      graph.get(req.user.facebook + '/friends', function(err, friends) {
        done(err, friends.data);
      });
    }
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    res.render('api/facebook', {
      title: 'Facebook API',
      me: results.getMe,
      friends: results.getMyFriends
    });
  });
};

/**
 * GET /api/scraping
 * Web scraping example using Cheerio library.
 */
exports.getScraping = function(req, res, next) {
  cheerio = require('cheerio');
  request = require('request');

  request.get('https://news.ycombinator.com/', function(err, request, body) {
    var $ = cheerio.load(body);
    var links = [];
    $('.title a[href^="http"], a[href^="https"]').each(function() {
      links.push($(this));
    });
    res.render('api/scraping', {
      title: 'Web Scraping',
      links: links
    });
  });
};

/**
 * GET /api/steam
 * Steam API example.
 */
exports.getSteam = function(req, res, next) {
  request = require('request');

  var steamId = '76561197982488301';
  var params = { l: 'english', steamid: steamId, key: process.env.STEAM_KEY };
  
  async.parallel({
    playerAchievements: function(done) {
      params.appid = '49520';
      request.get({ url: 'http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/', qs: params, json: true }, function(err, request, body) {
        if (request.statusCode === 401) {
          return done(new Error('Invalid Steam API Key'));
        }
        done(err, body);
      });
    },
    playerSummaries: function(done) {
      params.steamids = steamId;
      request.get({ url: 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/', qs: params, json: true }, function(err, request, body) {
        if (request.statusCode === 401) {
          return done(new Error('Missing or Invalid Steam API Key'));
        }
        done(err, body);
      });
    },
    ownedGames: function(done) {
      params.include_appinfo = 1;
      params.include_played_free_games = 1;
      request.get({ url: 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/', qs: params, json: true }, function(err, request, body) {
        if (request.statusCode === 401) {
          return done(new Error('Missing or Invalid Steam API Key'));
        }
        done(err, body);
      });
    }
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    res.render('api/steam', {
      title: 'Steam Web API',
      ownedGames: results.ownedGames.response.games,
      playerAchievemments: results.playerAchievements.playerstats,
      playerSummary: results.playerSummaries.response.players[0]
    });
  });
};

/**
 * GET /api/venmo
 * Venmo API example.
 */
exports.getVenmo = function(req, res, next) {
  request = require('request');

  var token = _.find(req.user.tokens, { kind: 'venmo' });
  var query = { access_token: token.accessToken };

  async.parallel({
    getProfile: function(done) {
      request.get({ url: 'https://api.venmo.com/v1/me', qs: query, json: true }, function(err, request, body) {
        done(err, body);
      });
    },
    getRecentPayments: function(done) {
      request.get({ url: 'https://api.venmo.com/v1/payments', qs: query, json: true }, function(err, request, body) {
        done(err, body);
      });
    }
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    res.render('api/venmo', {
      title: 'Venmo API',
      profile: results.getProfile.data,
      recentPayments: results.getRecentPayments.data
    });
  });
};

/**
 * POST /api/venmo
 * Send money.
 */
exports.postVenmo = function(req, res, next) {
  validator = require('validator');

  req.assert('user', 'Phone, Email or Venmo User ID cannot be blank').notEmpty();
  req.assert('note', 'Please enter a message to accompany the payment').notEmpty();
  req.assert('amount', 'The amount you want to pay cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/venmo');
  }

  var token = _.find(req.user.tokens, { kind: 'venmo' });
  var formData = {
    access_token: token.accessToken,
    note: req.body.note,
    amount: req.body.amount
  };
  if (validator.isEmail(req.body.user)) {
    formData.email = req.body.user;
  } else if (validator.isNumeric(req.body.user) && validator.isLength(req.body.user, 10, 11)) {
    formData.phone = req.body.user;
  } else {
    formData.user_id = req.body.user;
  }
  request.post('https://api.venmo.com/v1/payments', { form: formData }, function(err, request, body) {
    if (err) {
      return next(err);
    }
    if (request.statusCode !== 200) {
      req.flash('errors', { msg: JSON.parse(body).error.message });
      return res.redirect('/api/venmo');
    }
    req.flash('success', { msg: 'Venmo money transfer complete' });
    res.redirect('/api/venmo');
  });
};

/**
 * GET /api/paypal
 * PayPal SDK example.
 */
/* exports.getPayPal = function(req, res, next) {
  paypal = require('paypal-rest-sdk');

  paypal.configure({
    mode: 'sandbox',
    client_id: process.env.PAYPAL_ID,
    client_secret: process.env.PAYPAL_SECRET
  });

  var paymentDetails = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: '/api/paypal/success',
      cancel_url: '/api/paypal/cancel'
    },
    transactions: [{
      description: 'Hackathon Starter',
      amount: {
        currency: 'USD',
        total: '1.99'
      }
    }]
  };

  paypal.payment.create(paymentDetails, function(err, payment) {
    if (err) {
      return next(err);
    }
    req.session.paymentId = payment.id;
    var links = payment.links;
    for (var i = 0; i < links.length; i++) {
      if (links[i].rel === 'approval_url') {
        res.render('api/paypal', {
          approvalUrl: links[i].href
        });
      }
    }
  });
};
 */
/**
 * GET /api/paypal/success
 * PayPal SDK example.
 */
/* exports.getPayPalSuccess = function(req, res) {
  var paymentId = req.session.paymentId;
  var paymentDetails = { payer_id: req.query.PayerID };
  paypal.payment.execute(paymentId, paymentDetails, function(err) {
    if (err) {
      res.render('api/paypal', {
        result: true,
        success: false
      });
    } else {
      res.render('api/paypal', {
        result: true,
        success: true
      });
    }
  });
}; */

/**
 * GET /api/paypal/cancel
 * PayPal SDK example.
 */
/* exports.getPayPalCancel = function(req, res) {
  req.session.paymentId = null;
  res.render('api/paypal', {
    result: true,
    canceled: true
  });
};
 */

exports.getFileUpload = function(req, res, next) {
  res.render('api/upload', {
    title: 'File Upload'
  });
};

exports.postFileUpload = function(req, res, next) {
  req.flash('success', { msg: 'File was uploaded successfully.'});
  res.redirect('/api/upload');
};
