import React from 'react';
import {Page, Card, Banner, FormLayout, Select, TextField, Layout, Button, Icon, ResourceList, Thumbnail, TextStyle, Tabs, Badge, Link} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';

class OrderList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      orders: []
    }
  }

  componentWillMount() {
    console.log("props", this.props);

    let orderItems = this.props.orders.map(order => {
      let createdAtDate = new Date(order.created_at)
      let processedAtDate = new Date(order.processed_at)
      let deliveryMethod = order.note_attributes.filter(note => note.name === 'checkout_method' ? note.value : null)
      console.log('meh', deliveryMethod);

      return (
        {
          attributeOne: <Link url={`https://bamboojuices.myshopify.com/admin/orders/${order.id}`}>{order.name}</Link>,
          attributeTwo: <Link url={`https://bamboojuices.myshopify.com/admin/customers/${order.customer.id}`}>{order.customer.first_name + ' ' + order.customer.last_name}</Link>,
          attributeThree: order.currency + ' ' + order.total_price,
          badges: [
            {content: createdAtDate.toLocaleDateString()},
            {content: deliveryMethod[0].value },
          ],
          actions: [{content: 'order details', onAction: () => { window.location.href = `https://bamboojuices.myshopify.com/admin/orders/${order.id}` }}],
          persistActions: true,
        }
      )
    })

    this.setState({
      orders: orderItems
    })
  }



  render() {

    return (
      <div className="bamboo-orderList">
      <EmbeddedApp
        apiKey={this.props.apiKey}
        shopOrigin={this.props.shopOrigin}
      >
        <Page
          title={`Orders`}
          primaryAction={{content: 'Back', onAction: () => { window.location.href = '/dashboard' } }}
          >
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
              url: '/bundle',
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

                <Card
                  title="Orders"
                >
                  <ResourceList
                    items={this.state.orders}
                    renderItem={(item, index) => {
                      return <ResourceList.Item key={index} {...item} />;
                    }}
                  />
                </Card>
            </Layout.Section>
          </Layout>
        </Page>
      </EmbeddedApp>
      </div>
    );
  }

  handleCancel() {
    window.location = '/'
  }

}
export default OrderList
