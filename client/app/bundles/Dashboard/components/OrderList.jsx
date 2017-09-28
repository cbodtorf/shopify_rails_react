import React from 'react';
import {Page, Card, Layout, Button, Icon, TextStyle, Badge, Tooltip, Link} from '@shopify/polaris';
import {EmbeddedApp, Modal} from '@shopify/polaris/embedded';
import Navigation from '../../Global/components/Navigation';
import bambooIcon from 'assets/green-square.jpg';

class OrderList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      modalOpen: false,
      modalUrl: '',
      orders: [],
      fulfillModal: false,
      fulFillModalOrderId: '',
    }
  }

  componentWillMount() {
    console.log("props", this.props);
    // delete variant from failed charge
    // https://shopifysubscriptions.com/shipments/del_product_to_shipping?shopify_variant_id=34306716741&shipping_id=18798737

    let orderItems = this.props.orders.map((order) => {
      console.log('id: ', order.id);
      let createdAtDate = new Date(order.created_at)
      let processedAtDate = new Date(order.processed_at)
      let deliveryMethod = order.note_attributes.filter(note => note.name === 'checkout_method' ? note.value : null)
      let urlBase = 'https://bamboojuices.myshopify.com/admin/'
      let customerLink = order.status === "ERROR" ?
        <Link external="true" url={ `${urlBase}customers/${order.customer_id}`}>{order.first_name + ' ' + order.last_name }</Link> :
        <Link external="true" url={ `${urlBase}customers/${order.customer.id}`}>{order.customer.first_name + ' ' + order.customer.last_name }</Link>

      let editLink = <Link external="true" url={ `${urlBase}orders/${order.id}` }>Edit</Link>
      if (order.error_type) {
        if (order.error_type === "CUSTOMER_NEEDS_TO_UPDATE_CARD") {
          editLink = <Link external="true" url={ `https://checkout.rechargeapps.com/customer/${order.customer_hash}/card_edit/` }>Update Billing</Link>

        } else if (order.error_type === "SHOPIFY_REJECTED") {
          editLink = (<Link onClick={ () => { this.removeAndRecharge(order) }}>Remove Out of Stock Product, Retry charge</Link>)
        }
      }


      let fullfillmentBadge = (
        <Badge
          children={order.fulfillment_status === 'fulfilled' ? 'Fulfilled' : 'Unfulfilled'}
          status={order.fulfillment_status === 'fulfilled' ? 'success' : 'attention'}
        />
      )

      return (
        <tbody key={ order.id } className="ui-nested-link-container">
          <tr>
            <td><Link external="true" url={`${urlBase}orders/${order.id}`}>{ order.status === "ERROR" ? `#${order.id}` : order.name }
            { order.note !== null ? <Tooltip content={ order.note }><Icon source="notes" color="inkLightest"/></Tooltip> : '' }
            { order.error !== null ? <Tooltip content={ order.error[0] }><Icon color="red" source="alert"/></Tooltip> : '' }
            </Link></td>
            <td>{ customerLink }</td>
            <td>{ createdAtDate.toLocaleDateString() }</td>
            <td>{ fullfillmentBadge }</td>
            <td>${order.total_price}</td>
            <td>{ editLink }</td>
            <td><Link external="true" url={ `${urlBase}apps/order-printer/orders/bulk?shop=bamboojuices.myshopify.com&ids=${order.id}` }>Print</Link></td>
            <td><Link external="true" url={ `${urlBase}/orders/${order.id}/fulfill_and_ship` }>Fulfill</Link></td>
          </tr>
        </tbody>
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
                  <div className="table-wrapper">
                    <table className="table-hover expanded">
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
                        { this.state.orders }
                    </table>
                  </div>
                </Card>
            </Layout.Section>
          </Layout>
          <Modal
            src={ this.state.modalUrl }
            open={ this.state.modalOpen }
            width="large"
            title={ `Edit Customer` }
            onClose={() => {
              this.setState({ modalOpen: false })
            }}
          />
        </Page>
      </EmbeddedApp>
      </div>
    );
  }

  handleCancel() {
    window.location = '/'
  }

  removeAndRecharge(order) {
    let self = this

    order.out_of_stock_variants.forEach((variant) => {
      $.ajax({
         type: "GET",
         url: `https://shopifysubscriptions.com/shipments/del_product_to_shipping?shopify_variant_id=${variant}&shipping_id=${order.stripe_shipping_id}`,
         success: function (result) {
           console.log('result', result);
         },
         error: function (){
           window.alert("something wrong!");
         }
      }).then(function(res) {
        console.log('res', res);
        // $.ajax({
        //    type: "GET",
        //    url: `https://shopifysubscriptions.com/purchase/${order.address_id}/charge/${order.id}/pay`,
        //    success: function (result) {
        //     //  window.location = '/'
        //    },
        //    error: function (){
        //      window.alert("something wrong!");
        //    }
        // })
      })
    })
  }

}
export default OrderList
