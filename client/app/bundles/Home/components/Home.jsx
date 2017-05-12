import React from 'react';
import {Page, Card} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';

class Home extends React.Component {
  render() {
    const products = this.props.products.map((product, i) => {
      return (
        <Card
          key={i}
          title={product.title}
          primaryFooterAction={{content: 'check it out', url: `https://${this.props.shop_session.url}/admin/products/${product.id}`}}
          sectioned
        >
          <p>View a summary of {product.title}</p>
        </Card>
      );
    })
    return (
      <EmbeddedApp
        apiKey={this.props.apiKey}
        shopOrigin={this.props.shopOrigin}
      >
        <Page title="Home">
          { products }
        </Page>
      </EmbeddedApp>
    );
  }
}
export default Home
