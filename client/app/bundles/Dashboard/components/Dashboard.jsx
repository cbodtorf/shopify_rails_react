import React from 'react';
import {Page, Card, Banner, Tabs, Layout, Stack, Button, ButtonGroup, Heading, Link} from '@shopify/polaris';
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

    let dates = this.state.dates.map((date, i) => {
      var m = monthNames[date.getMonth()]
      var w = weekNames[date.getDay()]
      var d = date.getDate()
      return (
        <div key={i} className="dashboard-card-primary">
          <Card sectioned subdued={i != 0 ? true : false} >
            <div className="date">
              <h5>{m}</h5>
              <h5>{d}</h5>
              <h5>{w}</h5>
            </div>
            <div className="revenue">
              <h5>$24,003</h5>
            </div>

            <div className="delivery-wrapper morning">
              <Card sectioned title="Morning">
                <div className="delivery-count">
                  <h5>10</h5>
                  <Link url=''>Orders</Link>
                </div>

                <ButtonGroup segmented>
                  <Button fullWidth icon="view"></Button>
                  <Button fullWidth icon="notes"></Button>
                </ButtonGroup>
              </Card>
            </div>

            <div className="delivery-wrapper afternoon">
              <Card sectioned title="Afternoon">
                <div className="delivery-count">
                  <h5>8</h5>
                  <Link url=''>Orders</Link>
                </div>

                <ButtonGroup segmented>
                  <Button fullWidth icon="view"></Button>
                  <Button fullWidth icon="notes"></Button>
                </ButtonGroup>
              </Card>
            </div>

            <div className="delivery-wrapper pickup">
              <Card sectioned title="Pickups">
                <div className="delivery-count">
                  <h5>2</h5>
                  <Link url=''>Orders</Link>
                </div>

              </Card>
            </div>
          </Card>
        </div>
      );
    })

    return (
      <EmbeddedApp
        apiKey={this.props.apiKey}
        shopOrigin={this.props.shopOrigin}
      >
        <Page title="Dashboard">
          <Layout>
            <Layout.Section>
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
            </Layout.Section>

            <Layout.Section>
              <Stack
                alignment="fill"
                distribution="center"
                spacing="loose"
              >
                { dates }
              </Stack>
            </Layout.Section>
            <Layout.Section>
              <div className="counts">
                <Heading>Counts</Heading>
                <Stack
                  spacing="loose"
                  alignment="center"
                  distribution="center"
                  >
                  <Card sectioned title="Active Subscriptions" ><h5 className="count-content">{ this.props.activeSubscriberCount }</h5></Card>
                  <Card sectioned title="Total Customers" ><h5 className="count-content">{ this.props.customerCount }</h5></Card>
                  <Card sectioned title="Number of Products" ><h5 className="count-content">{ this.props.productCount }</h5></Card>
                </Stack>
              </div>
            </Layout.Section>
          </Layout>
        </Page>
      </EmbeddedApp>
    );
  }
}
export default Dashboard
