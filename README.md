# ovh-mail-redirection

Managing OVH Mail Redirection!


# Installation

    npm i -g ovh-mail-redirection


# Create Credential

You should create your own credential [here](https://api.ovh.com/createToken/?GET=/me&GET=/email/domain/*/redirection*&POST=/email/domain/*/redirection*&DELETE=/email/domain/*/redirection*).

After:

    export OMR_APP_KEY=<Application Key>
    export OMR_APP_SECRET=<Application Secret>
    export OMR_CONSUMER_KEY=<Consumer Key>


# Help

    OVH Mail redirection
    --------------------

    Usage:  omr <domain> [command]

    omr <domain> list                  list mail redirections
    omr <domain> create <from> <to>    create mail redirection
    omr <domain> remove <id>           remove mail redirection
    omr <domain> update <id> <to>      update mail redirection
