import React from 'react';
import {Page, Card, Banner} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';

class Error extends React.Component {
  render() {
    return (
      <EmbeddedApp
        apiKey={this.props.apiKey}
        shopOrigin={this.props.shopOrigin}
      >
        <Page title="Error">
          <Banner status="critical" title="There was an error onboarding your shop.">
            <p>In order for Parcelify to work properly, it requires access to Shopify's <a href="https://help.shopify.com/api/reference/carrierservice" target="_blank">CarrierService API</a>. Unfortunately, access to this API is restricted to <a href="https://www.shopify.ca/pricing" target="_blank">advanced plans</a> only. This restriction is imposed by Shopify and there's nothing Parcelify can do. Some clients mentioned they successfuly convinced Shopify to give them access to the API by calling their support, but we cannot promise anything. If you want to try it, here's what you need to know;</p>
            <br />
            <br />

            <ul>
              <li>You want to install <a href="https://apps.shopify.com/parcelify" target="_blank">Parcelify</a></li>
              <li>You need access to the <a href="https://help.shopify.com/api/reference/carrierservice" target="_blank">CarrierService API</a></li>
            </ul>

          </Banner>
        </Page>
      </EmbeddedApp>
    );
  }
}
export default Error
