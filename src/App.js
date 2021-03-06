/* eslint-disable */
import React, { Fragment } from 'react';
import Login from './pages/login';
import Home from './pages/home';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';

function App() {
  return (
    <Fragment>
      <HashRouter>
        <Switch>
          <Route path="/home" component={Home} />
          <Route path="/" component={Login} />
          <Route exact path="/" component={Login} />
          <Redirect to={'/login'} />
        </Switch>
      </HashRouter>
    </Fragment>
  );
}

export default App;
