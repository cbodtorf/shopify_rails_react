import React from 'react';
import {Page, Card, Banner, Layout, Stack, Button, ButtonGroup, Heading, Link, Icon, ResourceList, Pagination, FooterHelp} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';
import Order from './Order';
import Navigation from '../../Global/components/Navigation';
import bambooIcon from 'assets/green-square.jpg';
import packageIcon from 'assets/package.png';
import customerIcon from 'assets/customer.png';
import productIcon from 'assets/bottle.png';

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
      const formatedDate = new Date(date.date.split('-').join('/'))
      const m = monthNames[formatedDate.getMonth()]
      const w = weekNames[formatedDate.getDay()]
      const d = formatedDate.getDate()

      return (
        <div key={i} className="dashboard-card-primary">
          <Stack
          spacing="default"
          distribution="leading"
          >
            <Card sectioned subdued>
              <div className="date">
                <h5>{w}</h5>
                <h5>{m + ' ' + d}</h5>
              </div>
            </Card>

            <div className="delivery-wrapper">
              <Link url={`/showOrders?attribute=delivery&date=${formatedDate}`}>
                <Card sectioned title="Deliveries">
                  <div className="count-revenue">
                    <div className="pickup-count">
                      <h5>{date.delivery.length}</h5>
                    </div>
                    <div className="revenue">
                      <h5>${date.revenue.toFixed(2)}</h5>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
            <div className="delivery-wrapper pickup">
              <Link url={`/showOrders?attribute=pickup&date=${formatedDate}`}>
                <Card sectioned title="Pickups">
                  <div className="count-revenue">
                    <div className="pickup-count">
                      <h5>{date.pickup.length}</h5>

                    </div>
                    <div className="revenue">
                      <h5>${date.revenue.toFixed(2)}</h5>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>

            <div className="delivery-wrapper spreadsheet">
              <Card sectioned>
              <div className="time-button morning">
                <Heading>Morning</Heading>
                <ButtonGroup>
                    <Button outline fullWidth icon="notes" url={`/generateCSV.csv?attribute=items&time=morning&date=${formatedDate}`}>Items</Button>
                    <Button outline fullWidth icon="notes" url={`/generateCSV.csv?attribute=addresses&time=morning&date=${formatedDate}`}>Addresses</Button>
                </ButtonGroup>
              </div>
              <div className="time-button afternoon">
                <Heading>Afternoon</Heading>
                <ButtonGroup>
                    <Button outline fullWidth icon="notes" url={`/generateCSV.csv?attribute=items&time=afternoon&date=${formatedDate}`}>Items</Button>
                    <Button outline fullWidth icon="notes" url={`/generateCSV.csv?attribute=addresses&time=afternoon&date=${formatedDate}`}>Addresses</Button>
                </ButtonGroup>
              </div>
              </Card>
            </div>
          </Stack>
        </div>
      )
    })

    return (
      <div className="bamboo-dashboard">
        <EmbeddedApp
          apiKey={this.props.apiKey}
          shopOrigin={this.props.shopOrigin}
        >
          <Page title="Dashboard" fullWidth ref="dashboard" icon={bambooIcon}>
            <Layout>
              <Layout.Section>
                <Navigation selectedTab={0}/>
              </Layout.Section>
              <Layout.Section>
                <div className="counts">
                  <Heading>Store Overview</Heading>
                  <Stack
                    spacing="default"
                    distribution="leading"
                    >
                    <div className="count-block"><div className="count-icon"><img src={packageIcon}></img></div><Card sectioned title="Active Subscriptions" ><h5 className="count-content">{ this.props.activeSubscriberCount }</h5></Card></div>
                    <div className="count-block"><div className="count-icon"><img src={customerIcon}></img></div><Card sectioned title="Total Customers" ><h5 className="count-content">{ this.props.customerCount }</h5></Card></div>
                    <div className="count-block"><div className="count-icon"><img src={productIcon}></img></div><Card sectioned title="Total Products" ><h5 className="count-content">{ this.props.productCount }</h5></Card></div>
                  </Stack>
                </div>
              </Layout.Section>
              <Layout.Section>
                <Heading>Delivery and Pickup Information</Heading>

                  { dates }

              </Layout.Section>
              <Layout.Section>
                <div className="pendingShippingOrders">
                <Heading>Shipping Information</Heading>
                <Stack>
                  <div className="delivery-wrapper">
                    <Link url={`/showOrders?attribute=shipping&date=${new Date().toLocaleDateString()}`}>
                      <Card sectioned title="Shipping">
                        {/*
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
                            */}
                        <div className="count-revenue">
                          <div className="pickup-count">
                            <h5>{ this.props.shippingOrdersCount }</h5>
                          </div>
                          <div className="revenue">
                            <h5>${0}</h5>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </div>
                  <div className="delivery-wrapper spreadsheet">
                    <Card sectioned>
                    <Heading>Spreadsheet</Heading>
                    <div className="time-button">
                      <Button outline fullWidth icon="notes" url={`/generateCSV.csv?attribute=shipping`}>Items</Button>
                    </div>
                    </Card>
                  </div>
                  </Stack>
                </div>
              </Layout.Section>
              <Layout.Section>
                <FooterHelp>For more details on Bamboo, visit our site:<Link url="https://polaris.shopify.com"> E4 Consulting</Link>.</FooterHelp>
              </Layout.Section>
            </Layout>
          </Page>
        </EmbeddedApp>
      </div>
    );
  }
}
export default Dashboard
