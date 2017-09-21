import ReactOnRails from 'react-on-rails';

import Home from '../Home/components/Home';
import Error from '../Home/components/Error';
import Onboarding from '../Home/components/Onboarding';
import Dashboard from '../Dashboard/components/Dashboard';
import OrderList from '../Dashboard/components/OrderList';
import BundleEditor from '../Bundle/components/BundleEditor';
import RateEditor from '../Rate/components/RateEditor';
import OrderEditor from '../Order/components/OrderEditor';
import PickupLocations from '../Settings/components/PickupLocations';
import BlackoutDates from '../Settings/components/BlackoutDates';
import PostalCodes from '../Settings/components/PostalCodes';
import Navigation from '../Global/components/Navigation';
import ModalForm from '../Global/components/ModalForm';
import SearchBar from '../Global/components/SearchBar';
import Subscription from '../Subscription/components/Subscription';

// This is how react_on_rails can see the componenets in the browser.
ReactOnRails.register({
  Home,
  Error,
  Onboarding,
  Dashboard,
  OrderList,
  BundleEditor,
  RateEditor,
  OrderEditor,
  BlackoutDates,
  PickupLocations,
  PostalCodes,
  Navigation,
  SearchBar,
  ModalForm,
  Subscription,
});
