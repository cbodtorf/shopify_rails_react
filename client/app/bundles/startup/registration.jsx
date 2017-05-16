import ReactOnRails from 'react-on-rails';

import Home from '../Home/components/Home';
import Error from '../Home/components/Error';
import Onboarding from '../Home/components/Onboarding';
import Dashboard from '../Dashboard/components/Dashboard';

// This is how react_on_rails can see the HelloWorld in the browser.
ReactOnRails.register({
  Home,
  Error,
  Onboarding,
  Dashboard,
});
