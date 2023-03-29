import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

import { App } from 'components/App';

//import '../styles/index.scss';
import '../styles/custom.scss';

const rootNode = document.getElementById('root');
const root = ReactDOM.hydrateRoot(rootNode, <App />);