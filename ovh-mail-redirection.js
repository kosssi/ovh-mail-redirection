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
 * LIST DOMAINS
 **/
var listDomains = function (callback) {
    var ovh = new Ovh({
      appKey: appKey,
      appSecret: appSecret,
      consumerKey: consumerKey
    })

    var url = '/email/domain/'
    ovh.request('GET', url, function (err, domains) {
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
 * CREATE REDIRECTION
 **/
var createRedirection = function (domain, from, to, callback) {
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
 * REMOVE REDIRECTION
 **/
var removeRedirection = function (domain, id, callback) {
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
 * UPDATE REDIRECTION
 **/
var updateRedirection = function (domain, id, to, callback) {
  var ovh = new Ovh({
    appKey: appKey,
    appSecret: appSecret,
    consumerKey: consumerKey
  })

  var url = '/email/domain/' + domain + '/redirection/' + id + '/changeRedirection'
  var data = { to: to }

  ovh.request('POST', url, data, function (err, response) {
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

orm                                       list domains
omr <domain.com>                          list mail redirections
omr <from@domain.com> <to@domain2.com>    create or update mail redirection
omr rm <mon@domain.com>                   remove mail redirection
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
        pad(Array(paddingFrom + 5).join(' '), redirection.from) +
        '->    ' + redirection.to
      )
    })

    console.log('')
  }
}

var displayDomains = function (domains) {
  console.log('\nDomains:\n')
  domains.forEach(function (domain) {
    console.log('    ' + domain)
  })
}

// Help function

var pad = function (pad, str) {
  if (typeof str === 'undefined') {
    return pad
  }
  return (str + pad).substring(0, pad.length)
}

var getId = function (redirections, mail) {
  var redirection = redirections.filter(function (redirection) {
    return redirection.from === mail
  })

  if (redirection.length === 1) {
    return redirection[0].id
  }

  return false
}

//
// main
//

if (process.argv.length < 3) {
  // listDomains
  return listDomains(function (err, domains) {
    if (err) return console.log(err)
    displayDomains(domains)
    displayHelp()
  })
  process.exit()
}

var domain = process.argv[2]

if (domain === 'rm') {
  if (process.argv.length === 4) {
    domain = process.argv[3]
  } else {
    displayHelp()
    process.exit()
  }
}

if (domain.split('@').length > 1) {
  domain = domain.split('@')[1]
}

getMe(function (err, me) {
  if (err) return console.log(err)

  console.log('\nWelcome ' + me.firstname + ' you request \'' + domain + '\' domain.')

  if (process.argv.length === 3) {
    // listRedirections
    return listRedirections(domain, function (err, redirections) {
      if (err) return console.log(err)
      displayRedirections(redirections)
    })
  } else if (process.argv.length === 4) {
    listRedirections(domain, function (err, redirections) {
      if (err) return console.log(err)

      var id

      // removeRedirection
      if (process.argv[2] === 'rm' && validator.validate(process.argv[3])) {
        var mail = process.argv[3]
        id = getId(redirections, mail)

        if (!id) {
          console.log('\nThis mail \'' + mail + '\' doesn\'t exist.')
          process.exit()
        }

        removeRedirection(domain, id, function (err, response) {
          if (err) return console.log(err)

          console.log('\nRedirection removed!')
          listRedirections(domain, function (err, redirections) {
            if (err) return console.log(err)
            displayRedirections(redirections)
            process.exit()
          })
        })
      } else if (validator.validate(process.argv[2]) && validator.validate(process.argv[3])) {
        var from = process.argv[2]
        var to = process.argv[3]
        id = getId(redirections, from)
        if (id) {
          // updateRedirection
          updateRedirection(domain, id, to, function (err, response) {
            if (err) return console.log(err)

            console.log('\nRedirection updated!')
            listRedirections(domain, function (err, redirections) {
              if (err) return console.log(err)
              displayRedirections(redirections)
              process.exit()
            })
          })
        } else {
          // createRedirection
          createRedirection(domain, from, to, function (err, response) {
            if (err) return console.log(err)

            console.log('\nRedirection added!')
            listRedirections(domain, function (err, redirections) {
              if (err) return console.log(err)
              displayRedirections(redirections)
              process.exit()
            })
          })
        }
      } else {
        console.log('\nError: mail is invalid.')
        displayHelp()
      }
    })
  } else {
    displayHelp()
  }
})
