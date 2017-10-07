import React from 'react';
import {Page, Card, Layout, ButtonGroup, Button, Icon, TextStyle, Badge, Tooltip, Link, Checkbox, ActionList, Popover} from '@shopify/polaris';
import {EmbeddedApp, Modal} from '@shopify/polaris/embedded';
import Navigation from '../../Global/components/Navigation';
import bambooIcon from 'assets/green-square.jpg';

const rxOne = /^[\],:{}\s]*$/;
const rxTwo = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
const rxThree = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
const rxFour = /(?:^|:|,)(?:\s*\[)+/g;
const isJSON = (input) => (
  input.length && rxOne.test(
    input.replace(rxTwo, '@')
      .replace(rxThree, ']')
      .replace(rxFour, '')
  )
);

class OrderList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      bulkActionSelect: false,
      modalOpen: false,
      modalUrl: '',
      orders: [],
      fulfillModal: false,
      fulFillModalOrderId: '',
      ordersChecked: []
    }
  }

  componentWillMount() {
    console.log("props", this.props);

  }

  render() {
    let orderPageTitle = this.props.attribute.toLowerCase() === "shipping" ?
                         'Pending Shipping Orders' :
                         `${this.props.attribute} Date: ${new Date(this.props.date).toLocaleDateString()}`;

   let orderItems = this.props.orders.map((order) => {
     console.log('id: ', order.id);
     console.log('error: ', order.error);
     let createdAtDate = new Date(order.created_at)
     let processedAtDate = new Date(order.processed_at)
     let deliveryMethod = order.note_attributes.filter(note => note.name === 'checkout_method' ? note.value : null)
     let urlBase = `https://${this.props.shop_session.url}/admin/`

     let customerLink = <Link > No Customer </Link>
     if (order.customer_id || order.customer) {
       customerLink = order.status === "ERROR" ?
         <Link external="true" url={ `${urlBase}customers/${order.customer_id}`}>{order.first_name + ' ' + order.last_name }</Link> :
         <Link external="true" url={ `${urlBase}customers/${order.customer.id}`}>{order.customer.first_name + ' ' + order.customer.last_name }</Link>
     }

     let editLink = <Link external="true" url={ `${urlBase}orders/${order.id}` }>Edit</Link>

     if (order.error_type) {
       if (order.error_type === "CUSTOMER_NEEDS_TO_UPDATE_CARD") {
         editLink = <Link external="true" url={ `https://checkout.rechargeapps.com/customer/${order.customer_hash}/card_edit/` }>Update Billing</Link>
       } else if (order.error_type === "SHOPIFY_REJECTED") {
         editLink = (<Link onClick={ () => { this.removeAndRecharge(order) }}>Remove Out of Stock Product, Retry charge</Link>)
       } else if (order.error_type === "MISSING_DELIVERY_DATA") {
         editLink = (<Link external="true" url={ `/orders?id=${order.id}` }>Edit</Link>)
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
           <td><Checkbox checked={ this.state.ordersChecked.includes(Number(order.id)) } onChange={() => {
             let ordersChecked = this.state.ordersChecked.map((id) => { return id })
             this.state.ordersChecked.indexOf(order.id) !== -1 ? ordersChecked.splice(ordersChecked.indexOf(order.id), 1) : ordersChecked.push(order.id)
             this.setState({ ordersChecked: ordersChecked })
           }}/></td>
           <td><Link external="true" url={`${urlBase}orders/${order.id}`}>{ order.status === "ERROR" ? `#${order.id}` : order.name }
           { order.note !== null ? <div className="notice-icon"><Tooltip content={ order.note }><Icon source="notes" color="inkLightest"/></Tooltip></div> : '' }
           { order.error ? <div className="notice-icon"><Tooltip content={ order.error[0] }><Icon color="red" source="alert"/></Tooltip></div> : '' }
           </Link></td>
           <td>{ customerLink }</td>
           <td>{ createdAtDate.toLocaleDateString() }</td>
           <td>{ fullfillmentBadge }</td>
           <td>${order.total_price}</td>
           <td>{ editLink }</td>
           <td><Link external="true" url={ `${urlBase}apps/order-printer/orders/bulk?shop=${this.props.shop_session.url}&ids=${order.id}` }>Print</Link></td>
           <td><Link external="true" url={ `${urlBase}orders/${order.id}/fulfill_and_ship` }>Fulfill</Link></td>
         </tr>
       </tbody>
     )
   })
    return (
      <div className="bamboo-orderList">
      <EmbeddedApp
        apiKey={ this.props.apiKey }
        shopOrigin={ this.props.shopOrigin }
        forceRedirect={ false }
      >
        <Page
          icon= { bambooIcon }
          >
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={0}/>
            </Layout.Section>
            <Layout.Section>

                <Card
                  title={ orderPageTitle }
                  sectioned
                >
                  <div className="table-wrapper">
                    <table className="table-hover expanded">
                      <thead>
                        <tr>
                          <th className="bulk-select">
                          <ButtonGroup segmented>
                            <Button
                              disclosure={ !(this.state.ordersChecked.length > 0) }
                              disabled={ this.state.ordersChecked.length > 0 }
                              onClick={ () => {
                                let ordersChecked = []
                                this.state.ordersChecked.length === this.props.orders.length ? ordersChecked = [] : ordersChecked = this.props.orders.map((order) => { return order.id })
                                this.setState({ ordersChecked: ordersChecked })
                              }}
                              >
                            <Checkbox
                              checked={ this.state.ordersChecked.length === this.props.orders.length }
                              label={ this.state.ordersChecked.length > 0 ? `${this.state.ordersChecked.length} items selected` : '' }
                              onChange={ () => {
                              let ordersChecked = []
                              this.state.ordersChecked.length === this.props.orders.length ? ordersChecked = [] : ordersChecked = this.props.orders.map((order) => { return order.id })
                              this.setState({ ordersChecked: ordersChecked })
                            }}/></Button>
                            <Popover
                              active={ this.state.bulkActionSelect }
                              activator={
                                <div className={ this.state.ordersChecked.length > 0 ? "" : "hide" }>
                                  <Button disclosure onClick={ () => this.setState({ bulkActionSelect: !this.state.bulkActionSelect }) }></Button>
                                </div>
                              }
                              onClose={ () => this.setState({ bulkActionSelect: !this.state.bulkActionSelect }) }
                            >
                              <ActionList
                                items={[
                                  { content: 'Print', onAction: () => { this.bulkPrint() } },
                                  { content: 'Fulfill', url: `/bulk_fulfill?ids=${this.state.ordersChecked.join(',')}` },
                                ]}
                              />
                            </Popover>
                          </ButtonGroup>
                          </th>
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
                        { orderItems }
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

  bulkPrint() {
    var url = `https://${this.props.shop_session.url}/admin/apps/order-printer/orders/bulk?shop=${this.props.shop_session.url}&ids%5B%5D=${this.state.ordersChecked.join('&ids%5B%5D=')}`
    window.open(url, '_blank').focus()
  }

  bulkFulfill() {


  }

  retryCharge(order, fetchSettings) {
    const self = this

    return fetch(`https://shopifysubscriptions.com/purchase/${order.address_id}/charge/${order.id}/pay`, fetchSettings)
    .then(self._parseJSON) // Transform the data into json
    .then(function(data) {
        // Your code for handling the data you get from the API
        console.log("retry charge data", data)
        window.location = `/showOrders?attribute=errors&date=${new Date().toLocaleDateString()}&shop=${self.props.shop_session.url}`
    })
    .catch(function(error) {
        // This is where you run code if the server returns any errors
        console.error('Hmm something went wrong:', error)
    });
  }

  _parseJSON(response) {
      console.log("parse data", response)

    return response.text().then(function(text) {
      return isJSON(text) ? JSON.parse(text) : {}
    })
  }

  removeAndRecharge(order) {
    const self = this

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let fetchSettings = { method: 'GET',
               headers: myHeaders,
               credentials: 'same-origin',
               mode: 'no-cors',
               cache: 'default' };

    order.out_of_stock_variants.forEach((variant) => {
      fetch(`https://shopifysubscriptions.com/shipments/del_product_to_shipping?shopify_variant_id=${variant}&shipping_id=${order.stripe_shipping_id}`, fetchSettings)
      .then(self._parseJSON) // Transform the data into json
      .then(function(data) {
          // Your code for handling the data you get from the API
          console.log("remove out of stock data", data)

          self.retryCharge(order, fetchSettings)
      })
      .catch(function(error) {
          // This is where you run code if the server returns any errors
          console.error('Hmm something went wrong:', error)
      });
    })
  }

}
export default OrderList
