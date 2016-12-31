import omr from 'ovh-mail-redirection'

class Data {

  constructor() {
    this.domains = []
    this.redirections = []

    this.readDomainsFromStorage()
    this.readRedirectionsFromStorage()

    return this
  }

  //
  // DOMAINS
  //

  getDomains() {
    return this.domains
  }

  setDomains(domains) {
    this.domains = domains
    this.writeDomainsToStorage()
  }

  readDomainsFromStorage() {
    let domains = JSON.parse(window.localStorage.getItem('domains'))

    // Ensure a sensible default
    this.domains = domains || []
  }

  writeDomainsToStorage() {
    window.localStorage.setItem('domains', JSON.stringify(this.domains))
  }

  updateDomainsFromServer(callback) {
    let _this = this

    omr.listDomains(function (err, domains) {
      if (err) {
        console.log(err)
      } else {
        _this.setDomains(domains)
      }

      callback(null, _this.domains)
    })
  }

  //
  // REDIRECTIONS
  //

  getRedirections(domain) {
    if (this.redirections[domain]) {
      return this.redirections[domain]
    }

    return []
  }

  setRedirections(domain, redirections) {
    this.redirections[domain] = redirections
    this.writeRedirectionToStorage(domain)
  }

  readRedirectionsFromStorage() {
    let _this = this

    this.domains.map((domain) => {
      let redirections = JSON.parse(window.localStorage.getItem(domain))

      // Ensure a sensible default
      _this.redirections[domain] = redirections || []
    })
  }

  writeRedirectionToStorage(domain) {
    if (this.redirections[domain]) {
      window.localStorage.setItem(domain, JSON.stringify(this.redirections[domain]))
    }
  }

  writeRedirectionsToStorage() {
    let _this = this

    this.domains.map((domain) => {
      _this.writeRedirectionToStorage(domain)
    })
  }

  updateAllRedirectionsFromServer(callback) {
    let _this = this;
    const domainLength = row.length;

    this.domains.map((domain, i) => {
      _this.updateRedirectionsFromServer(domain, (err, redirections) => {
        if (domainLength === i + 1) {
          callback();
        }
      })
    })
  }

  updateRedirectionsFromServer(domain, callback) {
    let _this = this

    omr.listRedirections(domain, function (err, redirections) {
      if (err) {
        console.log(err)
      } else {
        _this.setRedirections(domain, redirections)
      }

      callback(null, _this.redirections[domain])
    })
  }
}

export default Data
