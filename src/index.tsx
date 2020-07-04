import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App/App';

import 'typeface-roboto';
import './less/index.less';

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
