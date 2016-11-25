#!/usr/bin/env node

// https://api.ovh.com/createToken/?GET=/me&GET=/email/domain/*/redirection*&POST=/email/domain/*/redirection*&DELETE=/email/domain/*/redirection*

var Ovh = require('ovh')
var async = require('async')
var validator = require('email-validator')

var appKey = process.env.OMR_APP_KEY
var appSecret = process.env.OMR_APP_SECRET
var consumerKey = process.env.OMR_CONSUMER_KEY

// CRUD

/**
 * GET ME
 **/
var getMe = function (callback) {
  var ovh = new Ovh({
    appKey: appKey,
    appSecret: appSecret,
    consumerKey: consumerKey
  })

  ovh.request('GET', '/me', callback)
}

/**
 * LIST
 **/
var list = function (domain, callback) {
  var ovh = new Ovh({
    appKey: appKey,
    appSecret: appSecret,
    consumerKey: consumerKey
  })

  var url = '/email/domain/' + domain + '/redirection'
  ovh.request('GET', url, function (err, redirections) {
    if (err) {
      console.log('Get Redirections Error:')
      return callback(err)
    }

    async.map(
      redirections,
      function (redirection, callback) {
        ovh.request('GET', url + '/' + redirection, callback)
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
 * CREATE
 **/
var create = function (domain, from, to, callback) {
  var ovh = new Ovh({
    appKey: appKey,
    appSecret: appSecret,
    consumerKey: consumerKey
  })

  var url = '/email/domain/' + domain + '/redirection'
  var data = { from: from, to: to, localCopy: false }

  ovh.request('POST', url, data, function (err, response) {
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
 * REMOVE
 **/
var remove = function (domain, id, callback) {
  var ovh = new Ovh({
    appKey: appKey,
    appSecret: appSecret,
    consumerKey: consumerKey
  })

  var url = '/email/domain/' + domain + '/redirection/' + id

  ovh.request('DELETE', url, function (err, response) {
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
 * UPDATE
 **/
var update = function (domain, id, to, callback) {
  var ovh = new Ovh({
    appKey: appKey,
    appSecret: appSecret,
    consumerKey: consumerKey
  })

  var url = '/email/domain/' + domain + '/redirection/' + id + '/changeRedirection'

  ovh.request('DELETE', url, function (err, response) {
    if (err) {
      console.log('Add Error:')
      return callback(err)
    }

    callback(null, response)
  })
}

//
// display function
//

var displayHelp = function () {
  console.log(`
OVH Mail redirection
--------------------

Usage:  omr <domain> [command]

omr <domain> list                  list mail redirections
omr <domain> create <from> <to>    create mail redirection
omr <domain> remove <id>           remove mail redirection
omr <domain> update <id> <to>      update mail redirection
`)
}

var displayRedirections = function (redirections) {
  console.log('\nRedirections:\n')
  if (redirections) {
    var paddingFrom = 0
    var paddingId = 0
    redirections.forEach(function (redirection) {
      if (redirection.from.length > paddingFrom) {
        paddingFrom = redirection.from.length
      }
      if (redirection.id.length > paddingId) {
        paddingId = redirection.id.length
      }
    })

    redirections.forEach(function (redirection) {
      console.log('    ' +
        pad(Array(paddingId + 5).join(' '), redirection.id) +
        ':    ' +
        pad(Array(paddingFrom + 5).join(' '), redirection.from) +
        '->    ' + redirection.to
      )
    })

    console.log('')
  }
}

// Help function

var pad = function (pad, str) {
  if (typeof str === 'undefined') {
    return pad
  }
  return (str + pad).substring(0, pad.length)
}

// main

if (process.argv.length < 3) {
  displayHelp()
  process.exit()
}

var domain = process.argv[2]

getMe(function (err, me) {
  if (err) return console.log(err)

  console.log('\nWelcome ' + me.firstname + ' you request \'' + domain + '\' domain.')

  if (process.argv.length === 3) {
    return list(domain, function (err, redirections) {
      if (err) return console.log(err)
      displayRedirections(redirections)
    })
  }

  var id, to

  switch (process.argv[3]) {
    case 'list':
      list(domain, function (err, redirections) {
        if (err) return console.log(err)
        displayRedirections(redirections)
      })
      break
    case 'create':
      if (process.argv.length === 6) {
        var from = process.argv[4]
        to = process.argv[5]

        if (validator.validate(from) && validator.validate(to)) {
          create(domain, from, to, function (err, response) {
            if (err) return console.log(err)

            console.log('\nRedirection added!')
            list(domain, function (err, redirections) {
              if (err) return console.log(err)
              displayRedirections(redirections)
            })
          })
          break
        } else {
          console.log('\nError: email invalid.')
        }
      }
      displayHelp()
      break
    case 'remove':
      if (process.argv.length === 5) {
        id = process.argv[4]

        remove(domain, id, function (err, response) {
          if (err) return console.log(err)

          console.log('\nRedirection removed!')
          list(domain, function (err, redirections) {
            if (err) return console.log(err)
            displayRedirections(redirections)
          })
        })

        break
      }
      displayHelp()
      break
    case 'update':
      if (process.argv.length === 6) {
        id = process.argv[4]
        to = process.argv[5]

        if (validator.validate(to)) {
          update(domain, id, to, function (err, response) {
            if (err) return console.log(err)

            console.log('\nRedirection updated!')
            list(domain, function (err, redirections) {
              if (err) return console.log(err)
              displayRedirections(redirections)
            })
          })
          break
        } else {
          console.log('\nError: email invalid.')
        }
      }
      displayHelp()
      break
    default:
      displayHelp()
  }
})
