import React from 'react';
import {Page, Card, Banner, Tabs} from '@shopify/polaris';
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
        <Tabs
          selected={0}
          fitted
          tabs={[
            {
              id: 'dashboard',
              title: 'Dashboard',
              panelID: 'dashboard',
              url: '/dashboard',
            },
            {
              id: 'rates',
              title: 'Rates',
              panelID: 'rates',
              url: '/rates',
            },
            {
              id: 'bundles',
              title: 'Bundles',
              panelID: 'bundles',
              url: `/bundle?id=${this.props.bundles[0].id}`,
            },
            {
              id: 'settings',
              title: 'Settings',
              panelID: 'settings',
              url: '/settings',
            },
          ]}
        />
          <Card
            title="Orders/Sales"
          >
          
          </Card>
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
