import React from 'react'
import ReactDOM from 'react-dom'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import {List, ListItem} from 'material-ui/List'
import Paper from 'material-ui/Paper'

import RaisedButton from 'material-ui/RaisedButton'
import {Table, TableBody, TableRow, TableRowColumn} from 'material-ui/Table'

import TextField from 'material-ui/TextField'
import Snackbar from 'material-ui/Snackbar'

import Subheader from 'material-ui/Subheader'

import AppBar from 'material-ui/AppBar'

import omr from '../../../../ovh-mail-redirection'

import IconButton from 'material-ui/IconButton'
import ActionSync from 'material-ui/svg-icons/notification/sync'

import LinearProgress from 'material-ui/LinearProgress'

var App = React.createClass({
  getInitialState: function () {
    this.getDomains()
    return {
      domains: [],
      domain: '',
      redirections: [],
      redirectionsSelected: [],
      fromInput: '',
      toInput: '',
      snackbarOpen: false,
      snackbarMessage: '',
      progressBar: false
    }
  },
  getDomains: function () {
    var _this = this
    this.setState({progressBar: true})
    omr.listDomains(function (err, domains) {
      if (err) {
        console.log(err)
        return
      }
      _this.setState({
        domains: domains,
        progressBar: false
      })
    })
  },
  getRedirections: function (element) {
    var _this = this
    var domain
    if (typeof element === 'string') {
      domain = element
    } else {
      domain = element.currentTarget.textContent
    }
    this.setState({domain: domain, progressBar: true})
    omr.listRedirections(domain, function (err, redirections) {
      if (err) {
        console.log(err)
        return
      }
      _this.setState({redirections: redirections, progressBar: false})
    })
  },
  rowSelected: function (rows) {
    var _this = this
    var redirectionsSelected = []
    rows.map(function (row) {
      redirectionsSelected.push(_this.state.redirections[row])
    })
    this.setState({
      redirectionsSelected: redirectionsSelected
    })
  },
  removeRedirections: function () {
    var _this = this
    var lastRedirection = this.state.redirectionsSelected[this.state.redirectionsSelected.length - 1]
    this.setState({progressBar: true})
    this.state.redirectionsSelected.map(function (redirection) {
      omr.removeRedirection(_this.state.domain, redirection.id, function (err, response) {
        if (lastRedirection === redirection) {
          _this.setState({progressBar: false})
        }
        if (err) {
          console.log(err)
          return
        }
        let redirections = _this.state.redirections.filter(item => item !== redirection)
        _this.setState({
          redirections: redirections
        })
      })
    })
    return false
  },
  addRedirection: function () {
    var _this = this
    this.setState({progressBar: true})
    omr.createRedirection(this.state.domain, this.state.fromInput, this.state.toInput, function (err, response) {
      if (err) {
        if (err.indexOf('409') !== -1) {
          _this.setState({
            snackbarMessage: 'Redirection already exist.',
            snackbarOpen: true,
            progressBar: false
          })
        } else {
          console.log(err)
        }
        return
      }
      _this.getRedirections(_this.state.domain)
      _this.setState({
        snackbarMessage: 'Redirection added.',
        snackbarOpen: true,
        progressBar: false
      })
    })
  },
  isSelected: function (redirection) {
    return this.state.redirectionsSelected.indexOf(redirection) !== -1
  },
  fromChange: function (event) {
    this.setState({fromInput: event.target.value})
  },
  toChange: function (event) {
    this.setState({toInput: event.target.value})
  },
  snackbarClose: function () {
    this.setState({snackbarOpen: false})
  },
  render: function () {
    var _this = this
    var listStyle = function (domain) {
      let style = {
        width: '100%'
      }
      if (domain === _this.state.domain) {
        style.backgroundColor = 'rgba(0,0,0,0.0980392)'
      }
      return style
    }
    return (
      <MuiThemeProvider>
        <div>
          <AppBar
            title={
              <div>
                <TextField id='from' hintText='From' onChange={this.fromChange} />
                <TextField id='to' hintText='To' style={{marginLeft: '50px'}} onChange={this.toChange} />
              </div>
            }
            iconElementLeft={<span />}
            iconElementRight={
              <div>
                <RaisedButton style={{marginTop: '6px', marginRight: '80px'}} label='Add' onClick={this.addRedirection} />
                <RaisedButton style={{marginTop: '6px', marginRight: '12px'}} label='Remove' secondary disabled={this.state.redirectionsSelected.length === 0} onClick={this.removeRedirections} />
              </div>
            }
          />
          <Paper style={{width: '260px', margin: '20px', height: '474px', backgroundColor: 'rgba(255, 255, 255, 0.7)', display: 'inline-block', verticalAlign: 'top', overflow: 'hidden'}}>
            <List style={{width: '100%'}}>
              <Subheader>
                <span>Domains</span>
                <IconButton onClick={this.getDomains} style={{float: 'right'}}>
                  <ActionSync style={{color: 'rgba(0, 0, 0, 0.541176)'}} />
                </IconButton>
              </Subheader>
              <div style={{overflowY: 'scroll', height: '426px'}}>
                {this.state.domains.map(function (i) {
                  return <ListItem primaryText={i} onClick={_this.getRedirections} style={listStyle(i)} />
                })}
              </div>
            </List>
          </Paper>
          <Paper style={{width: '580px', margin: '20px 20px 20px 0', height: '474px', backgroundColor: 'rgba(255, 255, 255, 0.7)', display: 'inline-block', verticalAlign: 'top', overflowY: 'hidden'}}>
            <div style={{overflowY: 'scroll', height: '474px'}}>
              <Table multiSelectable='true' onRowSelection={_this.rowSelected}>
                <TableBody deselectOnClickaway={false}>
                  {this.state.redirections.map(function (redirection) {
                    return (
                      <TableRow key={redirection.id} selected={_this.isSelected(redirection)}>
                        <TableRowColumn>{redirection.from}</TableRowColumn>
                        <TableRowColumn>{redirection.to}</TableRowColumn>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </Paper>
          <Snackbar
            open={this.state.snackbarOpen}
            message={this.state.snackbarMessage}
            autoHideDuration={4000}
            onRequestClose={this.snackbarClose}
          />
          <LinearProgress mode='indeterminate' style={{position: 'absolute', bottom: 0, display: this.state.progressBar ? 'block' : 'none'}} />
        </div>
      </MuiThemeProvider>
    )
  }
})

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
