import React from 'react';
import {Page, Card, Banner} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';
import Order from './Order';

class Dashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  componentWillMount() {
    this.setState({orders: this.props.orders})
  }

  render() {
    let orders = this.state.orders.map(order => {
      return (
        <Order key={order.id} orderData={order} shopOrigin={this.props.shopOrigin}/>
      );
    })

    return (
      <EmbeddedApp
        apiKey={this.props.apiKey}
        shopOrigin={this.props.shopOrigin}
      >
        <Page title="Dashboard">
          <Card
          >
          { orders }
          </Card>
        </Page>
      </EmbeddedApp>
    );
  }
}
export default Dashboard
