import ReactOnRails from 'react-on-rails';

import Home from '../Home/components/Home';
import Error from '../Home/components/Error';
import Onboarding from '../Home/components/Onboarding';
import Dashboard from '../Dashboard/components/Dashboard';
import BundleEditor from '../Bundle/components/BundleEditor';
import RateEditor from '../Rate/components/RateEditor';
import Settings from '../Settings/components/Settings';

// This is how react_on_rails can see the HelloWorld in the browser.
ReactOnRails.register({
  Home,
  Error,
  Onboarding,
  Dashboard,
  BundleEditor,
  RateEditor,
  Settings,
});
