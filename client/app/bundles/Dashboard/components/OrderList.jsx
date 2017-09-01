import React from 'react';
import {Page, Card, Layout, Button, Icon, TextStyle, Badge, Link} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';
import Navigation from '../../Global/components/Navigation';
import bambooIcon from 'assets/green-square.jpg';

class OrderList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      orders: [],
      fulfillModal: false,
      fulFillModalOrderId: '',
    }
  }

  componentWillMount() {
    console.log("props", this.props);

    let orderItems = this.props.orders.map((order) => {
      let createdAtDate = new Date(order.created_at)
      let processedAtDate = new Date(order.processed_at)
      let deliveryMethod = order.note_attributes.filter(note => note.name === 'checkout_method' ? note.value : null)
      let urlBase = 'https://bamboojuices.myshopify.com/admin/'
      let fullfillmentBadge = (
        <Badge
          children={order.fulfillment_status === 'fulfilled' ? 'Fulfilled' : 'Unfulfilled'}
          status={order.fulfillment_status === 'fulfilled' ? 'success' : 'attention'}
        />
      )

      return (
        <tr key={order.id}>
          <td><Link external="true" url={`${urlBase}orders/${order.id}`}>{order.name}</Link></td>
          <td><Link external="true" url={`${urlBase}customers/${order.customer.id}`}>{order.customer.first_name + ' ' + order.customer.last_name}</Link></td>
          <td>{createdAtDate.toLocaleDateString()}</td>
          <td>{ fullfillmentBadge }</td>
          <td>${order.total_price}</td>
          <td><Link external="true" url={`${urlBase}orders/${order.id}`}>Edit</Link></td>
          <td><Link external="true" url={`${urlBase}apps/order-printer/orders/bulk?shop=bamboojuices.myshopify.com&ids=${order.id}`}>Print</Link></td>
          <td><Link external="true" url={`${urlBase}/orders/${order.id}/fulfill_and_ship`}>Fulfill</Link></td>
        </tr>
      )
    })

    this.setState({
      orders: orderItems
    })
  }

  render() {
    let orderPageTitle = this.props.attribute.toLowerCase() === "shipping" ?
                         'Pending Shipping Orders' :
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
          fullWidth
          primaryAction={{content: 'Back', onAction: () => { window.location.href = '/dashboard' } }}
          >
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={0}/>
            </Layout.Section>
            <Layout.Section>

                <Card
                  title={orderPageTitle}
                  sectioned
                >
                    <table>
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Customer</th>
                          <th>Order Created</th>
                          <th>Status</th>
                          <th>Total</th>
                          <th>Edit</th>
                          <th>Print</th>
                          <th>Fulfill</th>
                        </tr>
                      </thead>
                      <tbody>
                        { this.state.orders }
                      </tbody>
                    </table>
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
