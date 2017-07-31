import React from 'react';
import {Page, Card, Banner, Tabs, Layout, Stack, Button, ButtonGroup, Heading, Subheading, Link, Icon, Tooltip, ResourceList, Pagination} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';
import Navigation from '../../Global/components/Navigation';

class Subscription extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  componentWillMount() {
    console.log('props: ', this.props)
    let subscriptionList = this.props.subscriptions.map(sub => {
      return ({
        attributeOne: <Link external="true" url={`https://bamboojuices.myshopify.com/admin/apps/shopify-recurring-payments/customer/${sub.customer_id}/subscription/${sub.id}`}>{sub.customer.first_name + ' ' + sub.customer.last_name}</Link>,
        attributeTwo: new Date(sub.next_charge_scheduled_at).toLocaleDateString(),
        attributeThree: new Date(new Date(sub.next_charge_scheduled_at).setDate(new Date(sub.next_charge_scheduled_at).getDate() + 1)).toLocaleDateString(),
        actions: [
          {content: 'edit', onAction: () => { window.open(`https://bamboojuices.myshopify.com/admin/apps/shopify-recurring-payments/addresses/${sub.address_id}`, '_blank').focus() }},
        ],
        persistActions: true,
      })
    })

    this.setState({
      subscriptionList: subscriptionList,
    })
  }

  render() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const weekNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

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
              <div className="upcomingSubscriptions">
                <Heading>Upcoming Subscription Orders</Heading>
                <Card sectioned>
                    <div>
                      <table>
                        <thead>
                          <tr>
                            <th><Subheading>Customer</Subheading></th>
                            <th><Subheading>Charge Date</Subheading></th>
                            <th><Subheading>Delivery Date</Subheading></th>
                          </tr>
                        </thead>
                      </table>
                      <ResourceList
                        items={ this.state.subscriptionList }
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
          </Layout>
        </Page>
      </EmbeddedApp>
    );
  }
}
export default Subscription
