import React from 'react';
import {Page, Card, Banner, Tabs, Layout, Stack, Button, ButtonGroup} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';
import Order from './Order';

class Dashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      dates: []
    }
  }

  componentWillMount() {
    var date = new Date();
    const DAY = 1000 * 60 * 60 * 24;
    var dateArray = [];
    for (var i = 0; i < 5; i++) {
        if (i === 0) {
          dateArray.push(new Date(date.setTime(date.getTime())))
        } else {
          dateArray.push(new Date(date.setTime(date.getTime() + DAY)))
        }
      }
    console.log('dates: ', dateArray)
    this.setState({
      orders: this.props.orders,
      dates: dateArray
    })
  }

  render() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const weekNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    let orders = this.state.orders.map(order => {
      return (
        <Order key={order.id} orderData={order} shopOrigin={this.props.shopOrigin}/>
      );
    })
    let dates = this.state.dates.map((date, i) => {
      var m = monthNames[date.getMonth()]
      var w = weekNames[date.getDay()]
      var d = date.getDate()
      return (
        <Card key={i} sectioned>
          <div className="date">
            <h5>{m}</h5>
            <h5>{d}</h5>
            <h5>{w}</h5>
          </div>
          <div className="revenue">
            <h5>$24,003</h5>
          </div>


          <ButtonGroup segmented>
            <Button fullWidth icon='view'></Button>
            <Button fullWidth icon='notes'></Button>
          </ButtonGroup>
        </Card>
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
          <Layout>
            <Layout.Section>
              <Stack
                alignment="fill"
                distribution="center"
                spacing="loose"
              >
                { dates }
              </Stack>
            </Layout.Section>
          </Layout>
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
