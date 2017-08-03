import React from 'react';
import {Page, Card, Banner, Tabs, Layout, Stack, Button, ButtonGroup, Heading, Subheading, Link, Icon, Tooltip, ResourceList, Pagination} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';
import Order from './Order';
import Navigation from '../../Global/components/Navigation';

class Dashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  componentWillMount() {
    console.log('props: ', this.props)

    let shippingList = []
    this.props.orders.forEach(order => {
      /* TODO: handle orders that may not have note_attributes */
      let checkoutMethod = order.note_attributes.filter(note => note['name'] === 'checkout_method')

      if (checkoutMethod[0].value.toLowerCase() === 'shipping' && typeof checkoutMethod[0] !== 'undefined') {
        console.log('trying filter shipping orders', order);
        let fullfillmentBadge = {
          content: order.fulfillment_status === 'fulfilled' ? 'Fulfilled' : 'Unfulfilled',
          status: order.fulfillment_status === 'fulfilled' ? 'success' : 'attention'
        }
        shippingList.push({
          attributeOne: <Link external="true" url={`https://bamboojuices.myshopify.com/admin/orders/${order.id}`}>{order.name}</Link>,
          attributeTwo: new Date(order.created_at).toLocaleDateString(),
          attributeThree: 'items csv',
          badges: [
            fullfillmentBadge,
          ],
          actions: [
            {content: 'Order Details', onAction: () => { window.open(`https://bamboojuices.myshopify.com/admin/orders/${order.id}`, '_blank').focus() }},
          ],
          persistActions: true,
        })
      }
    })

    this.setState({
      fiveDayOrders: this.props.fiveDayOrders,
      shippingList: shippingList,
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
              <Card sectioned title="Delivery">
                <div className="title-line">
                </div>
                <div className="pickup-count">
                  <h5>{date.delivery.length}</h5>
                  <Link url={`/showOrders?attribute=delivery&date=${formatedDate}`}>Orders</Link>
                </div>
              </Card>
            </div>
            <div className="delivery-wrapper pickup">
              <Card sectioned title="Pickup">
              <div className="title-line">
              </div>
                <div className="pickup-count">
                  <h5>{date.pickup.length}</h5>
                  <Link url={`/showOrders?attribute=pickup&date=${formatedDate}`}>Orders</Link>
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
        <Page title="Dashboard" fullWidth ref='dashboard'>
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={0}/>
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
              <div className="pendingShippingOrders">
                <Heading>Pending Shipping Orders</Heading>
                <Card sectioned>
                    <div>
                      <table>
                        <thead>
                          <tr>
                            <th><Subheading>Order #</Subheading></th>
                            <th><Subheading>Date Created</Subheading></th>
                            <th><Subheading>Fullfillment Status</Subheading></th>
                            <th><Subheading>CSV</Subheading></th>
                          </tr>
                        </thead>
                      </table>
                      <ResourceList
                        items={ this.state.shippingList }
                        renderItem={(item, index) => {
                          return <ResourceList.Item key={index} {...item} />;
                        }}
                      />
                    </div>
                    <Pagination
                      hasPrevious
                      onPrevious={() => {}}
                      hasNext
                      onNext={() => {}}
                    />
                </Card>
              </div>
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
