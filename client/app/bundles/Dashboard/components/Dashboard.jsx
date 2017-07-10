import React from 'react';
import {Page, Card, Banner, Tabs, Layout, Stack, Button, ButtonGroup, Heading, Link, Tooltip} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';
import Order from './Order';

class Dashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  componentWillMount() {
    console.log('props: ', this.props)

    this.setState({
      fiveDayOrders: this.props.fiveDayOrders
    })
  }

  render() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const weekNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

    let dates = this.state.fiveDayOrders.map((date, i) => {
      var formatedDate = new Date(date.date.split('-').join('/'))
      var m = monthNames[formatedDate.getMonth()]
      var w = weekNames[formatedDate.getDay()]
      var d = formatedDate.getDate()

      var morningOrderIds = date.morning.concat(date.pickup).map(function(order) {
        return order.id
      }).join(',')
      var afternoonOrderIds = date.afternoon.map(function(order) {
        return order.id
      }).join(',')
      console.log('mo', morningOrderIds);
      console.log('af', afternoonOrderIds);

      return (
        <div key={i} className="dashboard-card-primary">
          <Card sectioned subdued={i != 0 ? true : false} >
            <div className="date">
              <h5>{m}</h5>
              <h5>{d}</h5>
              <h5>{w}</h5>
            </div>
            <div className="revenue">
              <h5>${date.revenue.toFixed(2)}</h5>
            </div>

            <div className="delivery-wrapper">
              <Card sectioned title="Deliveries">
                <div className="title-line">
                </div>
                <div className="delivery-count">
                  <h5>{date.morning.length}</h5>
                  <Link url=''>Orders</Link>
                  <h3 className="delivery-time">AM</h3>
                </div>
                <div className="delivery-count">
                  <h5>{date.afternoon.length}</h5>
                  <Link url=''>Orders</Link>
                  <h3 className="delivery-time">PM</h3>
                </div>
              </Card>
            </div>
            <div className="delivery-wrapper pickup">
              <Card sectioned title="Pickup">
              <div className="title-line">
              </div>
                <div className="pickup-count">
                  <h5>{date.pickup.length}</h5>
                  <Link url=''>Orders</Link>
                </div>
              </Card>
            </div>

            <div className="delivery-wrapper spreadsheet morning">
              <Card sectioned>
                <Heading>Morning</Heading>
                <Heading>Spreadsheets</Heading>
                <ButtonGroup segmented>
                  <Tooltip content="morning items">
                    <Button fullWidth icon="view" url={`/generateCSV.csv?attribute=items&time=morning&date=${formatedDate}`}></Button>
                  </Tooltip>
                  <Tooltip content="morning addresses">
                    <Button fullWidth icon="notes" url={`/generateCSV.csv?attribute=addresses&time=morning&date=${formatedDate}`}></Button>
                  </Tooltip>
                </ButtonGroup>
              </Card>
            </div>
            <div className="delivery-wrapper spreadsheet afternoon">
              <Card sectioned>
                <Heading>Afternoon</Heading>
                <Heading>Spreadsheets</Heading>
                <ButtonGroup segmented>
                  <Tooltip content="afternoon items">
                    <Button fullWidth icon="view" url={`/generateCSV.csv?attribute=items&time=afternoon&date=${formatedDate}`}></Button>
                  </Tooltip>
                  <Tooltip content="afternoon addresses">
                    <Button fullWidth icon="notes" url={`/generateCSV.csv?attribute=addresses&time=afternoon&date=${formatedDate}`}></Button>
                  </Tooltip>
                </ButtonGroup>
              </Card>
            </div>

          </Card>
        </div>
      )
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
                    url: `/bundle`,
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
