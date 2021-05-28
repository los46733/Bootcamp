import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'//Exposes store to app.
import 'bootstrap/dist/css/bootstrap.css'//Load Before the app
import App from './components/App';
import configureStore from './store/configureStore'

// import reportWebVitals from './reportWebVitals';
//Store will wrap the application and load neccesary state's
ReactDOM.render(
  //Adds redux store to app
  //Provider wraps app
  <Provider store={configureStore()}>
    <App />
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
