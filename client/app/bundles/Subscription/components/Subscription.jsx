import React from 'react';
import {Page, Card, Banner, Tabs, Layout, Stack, Button, ButtonGroup, Heading, Subheading, Link, Icon, Tooltip, ResourceList, Pagination} from '@shopify/polaris';
import {EmbeddedApp, Modal} from '@shopify/polaris/embedded';
import Navigation from '../../Global/components/Navigation';
import bambooIcon from 'assets/green-square.jpg';

class Subscription extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      modalOpen: false,
      modalUrl: ''
    }
  }

  componentWillMount() {
    console.log('props: ', this.props)
    let subscriptionList = this.props.subscriptions.map(sub => {
      let urlBase = 'https://bamboojuices.myshopify.com/admin/apps/shopify-recurring-payments/'
      return (
        <tr key={sub.id}>
          <td><Link external="true" url={`${urlBase}addresses/${sub.address_id}`}>#{sub.id}</Link></td>
          <td><Link external="true" url={`${urlBase}customer/${sub.customer_id}/subscription/${sub.id}`}>{sub.customer.first_name + ' ' + sub.customer.last_name}</Link></td>
          <td>{new Date(sub.next_charge_scheduled_at).toLocaleDateString()}</td>
          <td>{ new Date(new Date(sub.next_charge_scheduled_at).setDate(new Date(sub.next_charge_scheduled_at).getDate() + 1)).toLocaleDateString() }</td>
          <td>${sub.price.toFixed(2)}</td>
          <td><Link external="true" onClick={() => {
              this.setState({modalOpen: true,
                modalUrl: `http://bamboojuices.myshopify.com/tools/recurring/customers/${sub.customer.hash}/subscriptions/`
              })
            }}>Edit</Link></td>
          <td><Link external="true" onClick={() => {
              this.setState({modalOpen: true,
                modalUrl: `http://bamboojuices.myshopify.com/tools/recurring/customers/${sub.customer.hash}/delivery_schedule/`
              })
            }}>Edit</Link></td>
        </tr>
      )
    })

    this.setState({
      subscriptionList: subscriptionList,
    })
  }

  render() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const weekNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    const pageTitle = this.props.subscriptions ?
                      'Upcoming Subscriptions' :
                      `${this.props.attribute} Date: ${new Date(this.props.date).toLocaleDateString()}`;

    return (
      <div className="bamboo-orderList">
      <EmbeddedApp
        apiKey={this.props.apiKey}
        shopOrigin={this.props.shopOrigin}
        forceRedirect={true}
      >
        <Page
          icon={bambooIcon}
          primaryAction={{content: 'Back', onAction: () => { window.location.href = '/dashboard' } }}
          >
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={1}/>
            </Layout.Section>
            <Layout.Section>

                <Card
                  title={pageTitle}
                  sectioned
                >
                    <table>
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Customer</th>
                          <th>Charge Date</th>
                          <th>Delivery Date</th>
                          <th>Total</th>
                          <th>Subscription</th>
                          <th>Schedule</th>
                        </tr>
                      </thead>
                      <tbody>
                        { this.state.subscriptionList }
                      </tbody>
                    </table>
                </Card>
            </Layout.Section>
          </Layout>
          <Modal
            src={this.state.modalUrl}
            open={this.state.modalOpen}
            width="large"
            title={`Edit Subscription`}
            onClose={() => {
              this.setState({modalOpen: false})
            }}
          />
        </Page>
      </EmbeddedApp>
      </div>
    );
  }
}
export default Subscription
