#!/usr/bin/env node

// https://api.ovh.com/createToken/?GET=/me&GET=/email/domain/*/redirection*&POST=/email/domain/*/redirection*&DELETE=/email/domain/*/redirection*

var Ovh = require('ovh')
var async = require('async')

var appKey = process.env.OMR_APP_KEY
var appSecret = process.env.OMR_APP_SECRET
var consumerKey = process.env.OMR_CONSUMER_KEY

var request = function (method, url, data, callback) {
  var ovh = new Ovh({
    appKey: appKey || process.env.OMR_APP_KEY,
    appSecret: appSecret || process.env.OMR_APP_SECRET,
    consumerKey: consumerKey || process.env.OMR_CONSUMER_KEY
  })

  if (data) {
    ovh.request(method, url, data, callback)
  } else {
    ovh.request(method, url, callback)
  }
}

// CRUD

/**
 * GET ME
 **/
var getMe = function (callback) {
  request('GET', '/me', null, callback)
}

/**
 * LIST DOMAINS
 **/
var listDomains = function (callback) {
  var url = '/email/domain/'
  request('GET', url, null, function (err, domains) {
    if (err) {
      console.log('Get Domains Error:')
      return callback(err)
    }

    callback(null, domains)
  })
}

/**
 * LIST REDIRECTIONS
 **/
var listRedirections = function (domain, callback) {
  var url = '/email/domain/' + domain + '/redirection'
  request('GET', url, null, function (err, redirections) {
    if (err) {
      console.log('Get Redirections Error:')
      return callback(err)
    }

    async.map(
      redirections,
      function (redirection, callback) {
        request('GET', url + '/' + redirection, null, callback)
      },
      function (err, redirections) {
        if (err) {
          console.log('Get Redirection Error:')
          return callback(err)
        }

        callback(null, redirections)
      }
    )
  })
}

/**
 * CREATE REDIRECTION
 **/
var createRedirection = function (domain, from, to, callback) {
  var url = '/email/domain/' + domain + '/redirection'
  var data = { from: from, to: to, localCopy: false }

  request('POST', url, data, function (err, response) {
    if (err) {
      if (err === '409') {
        return callback('\nError: this mail is already created.')
      } else if (err === '400') {
        return callback('\nError: this <from> mail is invalid.')
      } else if (err === '404') {
        return callback('\nError: this domain name is invalid.')
      }
      return callback('\nError: unknown error (' + err + ')')
    }

    callback(null, response)
  })
}

/**
 * REMOVE REDIRECTION
 **/
var removeRedirection = function (domain, id, callback) {
  var url = '/email/domain/' + domain + '/redirection/' + id
  request('DELETE', url, null, function (err, response) {
    if (err) {
      if (err === '404') {
        return callback('\nError: this mail <id> is invalid.')
      }
      return callback('\nError: unknown error (' + err + ')')
    }

    callback(null, response)
  })
}

/**
 * UPDATE REDIRECTION
 **/
var updateRedirection = function (domain, id, to, callback) {
  var url = '/email/domain/' + domain + '/redirection/' + id + '/changeRedirection'
  var data = { to: to }
  request('POST', url, data, function (err, response) {
    if (err) {
      console.log('Add Error:')
      return callback(err)
    }

    callback(null, response)
  })
}

module.exports = {
  getMe: getMe,
  listDomains: listDomains,
  listRedirections: listRedirections,
  createRedirection: createRedirection,
  removeRedirection: removeRedirection,
  updateRedirection: updateRedirection
}
