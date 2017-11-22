import React from 'react';
import {Page, Card, Layout, ButtonGroup, Button, Icon, TextStyle, Badge, Tooltip, Link, Checkbox, ActionList, Popover, Stack} from '@shopify/polaris';
import {EmbeddedApp, Modal} from '@shopify/polaris/embedded';
import Navigation from '../../Global/components/Navigation';
import bambooIcon from 'assets/green-square.jpg';

import SearchBar, {createFilter} from '../../Global/components/SearchBar';

const KEYS_TO_FILTERS = ['line_items.title', 'first_name', 'last_name', 'order_number', 'customer.last_name', 'customer.first_name', 'created_at']

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

const humanize_ = function(property) {
  return property.replace(/_/g, ' ')
      .replace(/(\w+)/g, function(match) {
        return match.charAt(0).toUpperCase() + match.slice(1);
      });
};

const determineFulfillment = function(status) {
  let statusColor,
      statusText;
  switch (status) {
    case null:
      statusColor = 'attention'
      statusText = 'Unfulfilled'
      break;
    case 'partial':
      statusColor = 'warning'
      statusText = 'Partially Fulfilled'
      break;
    case 'shipped':
      statusColor = 'default'
      statusText = 'Fulfilled'
      break;
    case 'unshipped':
      statusColor = 'attention'
      statusText = 'Unfulfilled'
      break;
    case 'fulfilled':
      statusColor = 'default'
      statusText = 'Fulfilled'
      break;
    default:
    statusColor = 'attention'
    statusText = 'Unfulfilled'
  }

  return {
    statusColor: statusColor,
    statusText: statusText
  }
}
const determinePayment = function(status) {
  let statusColor,
      statusText;
  switch (status) {
    case 'authorized':
      statusColor = 'attention'
      statusText = 'Authoried'
      break;
    case 'pending':
      statusColor = 'attention'
      statusText = 'Pending'
      break;
    case 'partially_paid':
      statusColor = 'default'
      statusText = 'Partially Paid'
      break;
    case 'paid':
      statusColor = 'default'
      statusText = 'Paid'
      break;
    case 'partially_refunded':
      statusColor = 'default'
      statusText = 'Partially Refunded'
      break;
    case 'refunded':
      statusColor = 'default'
      statusText = 'Refunded'
      break;
    case 'voided':
      statusColor = 'default'
      statusText = 'Voided'
      break;
    default:
    statusColor = 'attention'
    statusText = 'Authorized'
  }

  return {
    statusColor: statusColor,
    statusText: statusText
  }
}

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
      ordersChecked: [],
      searchTerm: '',
      showErrors: {}
    }
  }

  componentWillMount() {
    console.log("props", this.props);

  }

  render() {
    const attributeLowerCase = this.props.attribute.toLowerCase()

    let bulkActionList = []
    if (attributeLowerCase !== "errors") {
      bulkActionList = [
        { content: 'Print', onAction: () => { this.bulkPrint() } },
        { content: 'Fulfill', url: `/bulk_fulfill?ids=${this.state.ordersChecked.join(',')}` },
      ]
    }

    let orderPageTitle = ""
    if (attributeLowerCase === "shipping") {
      orderPageTitle = 'Pending Shipping Orders'
    } else if (attributeLowerCase === "errors") {
      orderPageTitle = 'Errors'
    } else {
      orderPageTitle = `${this.props.attribute} Date: ${new Date(this.props.date).toLocaleDateString()}`
    }

    // DYNAMIC HEADERS
    let showPrintHeader = <th>Print</th>
    let showFulfillHeader = <th>Fulfill</th>
    let showDeliveryRate = <th>Delivery Rate</th>
    let showEditSubHeader = null,
        showViewRechargeHeader = null,
        showErrorsHeader = null;

    if (attributeLowerCase === "errors") {
      showPrintHeader = null
      showDeliveryRate = null
      showFulfillHeader = null
      showEditSubHeader = <th>Subscription</th>
      showViewRechargeHeader = <th>Recharge</th>
      showErrorsHeader = <th>Show Errors</th>
    }

   let orderItems = this.props.orders.filter(
     createFilter(this.state.searchTerm, KEYS_TO_FILTERS)
   ).map((order) => {
     let subItem = order.tags.split(', ').includes('Subscription')
     let upcomingSub = order.address_id !== undefined
     let createdAtDate = new Date(order.created_at)
     let processedAtDate = new Date(order.processed_at)
     let urlBase = `https://${this.props.shop_session.url}/admin/`

     // SET ORDER NUMBER
     let orderLink = upcomingSub ?
       <TextStyle subdued>#{ order.id }</TextStyle> :
       <Link external="true" url={`${urlBase}orders/${order.id}`}>#{ order.order_number }</Link>
     // SET CUSTOMER NAME
     let customerName = "No Customer"
     if (order.customer_id || order.customer) {
       customerName = upcomingSub ? (order.first_name + ' ' + order.last_name) : (order.customer.first_name + ' ' + order.customer.last_name)
     }
     // SET EDIT ORDER/ATTRIBUTES
     let editLink = upcomingSub ? null : <Link url={ `/orders?id=${order.id}` }>Edit</Link>

     let editSubscriptionLink = null,
          viewRechargeLink = null,
          deliveryRate = null,
          errorMessages = null,
          showErrorsButton = null,
          printLink = <td><Link external="true" url={ `${urlBase}apps/order-printer/orders/bulk?shop=${this.props.shop_session.url}&ids=${order.id}` }>Print</Link></td>,
          fulfillLink = <td><Link external="true" url={ `${urlBase}orders/${order.id}/fulfill_and_ship` }>Fulfill</Link></td>;

      if (attributeLowerCase === "errors") {
        editSubscriptionLink = upcomingSub ?
         <td><Link external="true" url={`http://${this.props.shop_session.url}/tools/recurring/customers/${order.customer_hash}/subscriptions/`}>Edit</Link></td> : <td></td>
        viewRechargeLink = upcomingSub ?
         <td><Link external="true" url={ `${urlBase}apps/shopify-recurring-payments/addresses/${order.address_id}` }>View</Link></td> : <td></td>
        printLink = null
        fulfillLink = null
        deliveryRate = null

        // ERROR BUTTON
        showErrorsButton = <td><Link onClick={ () => {
            let showErrorsState = this.state.showErrors || {}
            showErrorsState[order.id] === true ? showErrorsState[order.id] = false : showErrorsState[order.id] = true
            this.setState({
              showErrors: showErrorsState
            })
          }}>{ this.state.showErrors[order.id] === true ? 'Hide' : 'Show' }</Link></td>

        // ERROR MESSAGES
        errorMessages = order.error.map((error, i) => {
            return (
              <Stack.Item key={i}><span style={{display: "inline-block", verticalAlign: "middle"}}><Icon source="risk"/></span> - { error }</Stack.Item>
            )
          })
      } else {
        deliveryRate = order.note_attributes.filter(note => humanize_(note.name) === 'Delivery Rate' ? note.value : null)[0]
        deliveryRate = <td>{ deliveryRate.value.split(']')[1] }</td>
      }

     const fulfillmentStatus = determineFulfillment(order.fulfillment_status)
     let fullfillmentBadge = (
       <Badge
         children={<TextStyle subdued>{ fulfillmentStatus.statusText }</TextStyle>}
         status={fulfillmentStatus.statusColor}
       />
     )
     const paymentStatus = determinePayment(order.financial_status)
     let paymentBadge = (
       <Badge
         children={<TextStyle subdued> { paymentStatus.statusText } </TextStyle>}
         status={paymentStatus.statusColor}
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
           <td>{ orderLink }
           { order.note !== null && order.note !== "" ? <div className="notice-icon"><Tooltip content={ order.note }><Icon source="notes" color="inkLightest"/></Tooltip></div> : '' }
           </td>
           <td>{ customerName }</td>
           <td>{ createdAtDate.toLocaleDateString() }</td>
           <td>{ paymentBadge }</td>
           <td>{ fullfillmentBadge }</td>
           { deliveryRate }
           <td>${order.total_price}</td>
           <td>{ editLink }</td>
           { editSubscriptionLink }
           { viewRechargeLink }
           { printLink }
           { fulfillLink }
           { showErrorsButton }
         </tr>
         <tr className={`ui-nested-link-container errors ${this.state.showErrors[order.id] === true ? 'show-errors' : 'hide-errors'}`}>
           <th colSpan="10">
             <Stack vertical spacing="tight" distribution="leading">
              { errorMessages }
             </Stack>
           </th>
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
              <Navigation selectedTab={ this.props.attribute.toLowerCase() === 'errors' ? 2 : 0 } shop={ this.props.shop_session.url }/>
            </Layout.Section>
            <Layout.Section>

                <Card
                  title={ orderPageTitle }
                  sectioned
                >
                  <div>
                    <SearchBar placeholder={ "Search by product or customer" } className="search-input" onChange={ this.searchUpdated.bind(this) } />
                  </div>
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
                                items={ bulkActionList }
                              />
                            </Popover>
                          </ButtonGroup>
                          </th>
                          <th>Order</th>
                          <th>Customer</th>
                          <th>Order Created</th>
                          <th>Payment Status</th>
                          <th>Fulfillment Status</th>
                          { showDeliveryRate }
                          <th>Total</th>
                          <th>Order</th>
                          { showEditSubHeader }
                          { showViewRechargeHeader }
                          { showPrintHeader }
                          { showFulfillHeader }
                          { showErrorsHeader }
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

  searchUpdated (term) {
    this.setState({ searchTerm: term })
  }

}
export default OrderList
