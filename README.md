# ovh-mail-redirection

![NPM Licence shield](https://img.shields.io/npm/l/ovh-mail-redirection.svg)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Dependency Status](https://www.versioneye.com/user/projects/58382469e7cea00039353ba7/badge.svg)](https://www.versioneye.com/user/projects/58382469e7cea00039353ba7)
[![GitHub tag](https://img.shields.io/github/tag/kosssi/ovh-mail-redirection.svg)](https://github.com/kosssi/ovh-mail-redirection/releases)
[![npm](https://img.shields.io/npm/v/ovh-mail-redirection.svg)](https://www.npmjs.com/package/ovh-mail-redirection)
[![npm](https://img.shields.io/npm/dt/ovh-mail-redirection.svg)](https://www.npmjs.com/package/ovh-mail-redirection)

Managing OVH Mail Redirection!


# Installation

    npm i -g ovh-mail-redirection


# Create Credential

You should create your own credential [here](https://api.ovh.com/createToken/?GET=/me&GET=/email/domain/&GET=/email/domain/*/redirection*&POST=/email/domain/*/redirection*&DELETE=/email/domain/*/redirection*).

After:

    export OMR_APP_KEY=<Application Key>
    export OMR_APP_SECRET=<Application Secret>
    export OMR_CONSUMER_KEY=<Consumer Key>


# Help

    OVH Mail redirection
    --------------------

    Usage:  omr <domain> [command]

    orm                                       list domains
    omr <domain.com>                          list mail redirections
    omr <from@domain.com> <to@domain2.com>    create or update mail redirection
    omr rm <mon@domain.com>                   remove mail redirection
