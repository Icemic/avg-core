import React, { Component } from 'react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router as RRouter, Route, IndexRedirect, Redirect, hashHistory } from 'react-router';
import { stateTree } from '../../core/data';

const routingStore = new RouterStore();
const history = syncHistoryWithStore(hashHistory, routingStore);

class Router extends Component {
  render() {
    return <RRouter {...this.props} history={history}/>;
  }
}

stateTree.append('router', routingStore);

export { Router, Route, IndexRedirect, Redirect };
