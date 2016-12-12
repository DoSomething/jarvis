import React, { Component } from 'react';
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router';

import Home from './components/Home.jsx';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router history={browserHistory}>
        <Route path='/admin' component={() => (<Home />)} />
      </Router>
    )
  }
}

export default App;
