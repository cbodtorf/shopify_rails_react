import React from 'react';
import {Page, Card, Banner} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';

class Onboarding extends React.Component {
  render() {
    return (
      <EmbeddedApp
        apiKey={this.props.apiKey}
        shopOrigin={this.props.shopOrigin}
      >
        <Page title="Onboarding">
          <Banner status="success" title="Onboarding">
            <p>We're currently syncing up with your Shopify shop. Please sit tight, it shouldn't take long (we hope so!).</p>
          </Banner>
        </Page>
      </EmbeddedApp>
    );
  }
}
export default Onboarding
