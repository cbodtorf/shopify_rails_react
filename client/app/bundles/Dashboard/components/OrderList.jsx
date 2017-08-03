import React from 'react';
import {Page, Card, Banner, FormLayout, Select, TextField, Layout, Button, Icon, ResourceList, Thumbnail, TextStyle, Tabs, Badge, Link} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';
import Navigation from '../../Global/components/Navigation';

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
          attributeOne: <Link external="true" url={`https://bamboojuices.myshopify.com/admin/orders/${order.id}`}>{order.name}</Link>,
          attributeTwo: <Link external="true" url={`https://bamboojuices.myshopify.com/admin/customers/${order.customer.id}`}>{order.customer.first_name + ' ' + order.customer.last_name}</Link>,
          attributeThree: order.currency + ' ' + order.total_price,
          badges: [
            {content: createdAtDate.toLocaleDateString()},
            {content: deliveryMethod[0].value },
          ],
          actions: [{content: 'order details', onAction: () => { window.open(`https://bamboojuices.myshopify.com/admin/orders/${order.id}`, '_blank').focus() }}],
          persistActions: true,
        }
      )
    })

    orderItems.unshift({
              attributeOne: 'Order #',
              attributeTwo: 'Customer',
              attributeThree: 'Total Price',
              badges: [
                {content: 'Created At'},
                {content: 'Method' },
              ],
              actions: [{content: 'details link'}],
              persistActions: true,
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
          fullWidth
          primaryAction={{content: 'Back', onAction: () => { window.location.href = '/dashboard' } }}
          >
          <Layout.Section>
            <Navigation selectedTab={0}/>
          </Layout.Section>

          <Layout>
            <Layout.Section>

                <Card
                  title="Orders"
                >
                  <a href='https://bamboojuices.myshopify.com/admin/apps/order-printer/orders/bulk?shop=bamboojuices.myshopify.com&ids%5B%5D=4842083077&ids%5B%5D=4835427589&ids%5B%5D=4835427397' target="_blank">Print Me</a>
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
