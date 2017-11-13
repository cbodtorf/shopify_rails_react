import React from 'react';
import {Page, Card, Banner, Tabs, Badge, Layout, Stack, Button, ButtonGroup, Heading, Subheading, Link, Icon, Tooltip, ResourceList, Pagination} from '@shopify/polaris';
import {EmbeddedApp, Modal, Alert} from '@shopify/polaris/embedded';
import Navigation from '../../Global/components/Navigation';
import bambooIcon from 'assets/green-square.jpg';

import SearchBar, {createFilter} from '../../Global/components/SearchBar';

const KEYS_TO_FILTERS = ['line_items.title', 'first_name', 'last_name', 'scheduled_at', ]

class Subscription extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      modalOpen: false,
      openAlert: false,
      modalUrl: '',
      searchTerm: '',
      showProduct: {}
    }
  }

  componentWillMount() {
    console.log('props: ', this.props)
  }

  render() {
    let urlBase = `https://${this.props.shop_session.url}/admin/apps/shopify-recurring-payments/`
    let subscriptionList = this.props.subscriptions.filter(
      createFilter(this.state.searchTerm, KEYS_TO_FILTERS)
    ).map(sub => {
      let productBadges = sub.line_items.map((item, i) => {
          return (
            <Badge key={i} status="success">{item.title.replace('Auto renew', '') + ' x' + item.quantity}</Badge>
          )
        })


      let chargeDate = new Date(sub.scheduled_at).toLocaleDateString()
      let deliveryDate = new Date(new Date(sub.scheduled_at).setDate(new Date(sub.scheduled_at).getDate() + 1)).toLocaleDateString()
      /**
      * Catch error :
      * Recharge won't set a scheduled_at if there is no payment record.
      */

      if (sub.scheduled_at === null) {
        chargeDate = "None -"
        deliveryDate = <Link external="true" url={`http://${this.props.shop_session.url}/tools/recurring/customers/${sub.customer_hash}/subscriptions/`}>Must edit Payment</Link>
      }

      let customerName = sub.first_name + ' ' + sub.last_name
      if (sub.shopify_customer_id) {
        customerName = <Link external="true" url={`http://${this.props.shop_session.url}/admin/customers/${sub.shopify_customer_id}`}>{ sub.first_name + ' ' + sub.last_name }</Link>
      }

      return (
          <tbody key={ sub.id } className="ui-nested-link-container">
            <tr className="">
              <td>
                #{ sub.id }
                { sub.note !== null ? <div className="notice-icon"><Tooltip content={ sub.note }><Icon source="notes" color="inkLightest"/></Tooltip></div> : '' }
              </td>
              <td>{ customerName }</td>
              <td>{ chargeDate }</td>
              <td>{ deliveryDate }</td>
              <td>${ sub.total_price }</td>

              <td>
                <Link
                  external="true"
                  url={`http://${this.props.shop_session.url}/tools/recurring/customers/${sub.customer_hash}/subscriptions/`}
                >
                  Edit
                </Link>
              </td>

              <td><Link onClick={ () => {
                  this.setState({ openAlert: true,
                    modalUrl: `${urlBase}addresses/${sub.address_id}`
                  })
                }}>View</Link></td>

              <td><Link onClick={ () => {
                  let showProduct = this.state.showProduct || {}
                  showProduct[sub.id] === true ? showProduct[sub.id] = false : showProduct[sub.id] = true
                  this.setState({
                    showProduct: showProduct
                  })
                }}>{ this.state.showProduct[sub.id] === true ? 'Hide' : 'Show' }</Link></td>
            </tr>

            <tr className={`ui-nested-link-container product ${this.state.showProduct[sub.id] === true ? 'show-product' : 'hide-product'}`}>
              <th colSpan="8">
                <Stack spacing="tight" distribution="leading">
                  { productBadges }
                </Stack>
              </th>
            </tr>
          </tbody>
      )
    })

    console.log("state: ", this.state)

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const weekNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    const pageTitle = this.props.subscriptions ?
                      'Upcoming Subscriptions' :
                      `${this.props.attribute} Date: ${new Date(this.props.date).toLocaleDateString()}`;

    return (
      <div className="bamboo-orderList">
      <EmbeddedApp
        apiKey={ this.props.apiKey }
        shopOrigin={ this.props.shopOrigin }
        forceRedirect={ true }
      >
        <Page
          icon={ bambooIcon }
          >
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={ 1 } shop={ this.props.shop_session.url }/>
            </Layout.Section>
            <Layout.Section>

                <Card
                  title={ pageTitle }
                  sectioned
                >
                  <div>
                    <SearchBar placeholder={ "Search by product or customer" } className="search-input" onChange={ this.searchUpdated.bind(this) } />
                  </div>
                    <div className="table-wrapper">
                      <table className="table-hover expanded">
                        <thead className="">
                          <tr className="">
                            <th>Subscription</th>
                            <th>Customer</th>
                            <th>Charge Date</th>
                            <th>Delivery Date</th>
                            <th>Total</th>
                            <th>Subscription</th>
                            <th>Recharge</th>
                            <th>Product</th>
                          </tr>
                        </thead>
                          { subscriptionList }
                      </table>
                    </div>
                </Card>
            </Layout.Section>
          </Layout>
          <Alert
            title="Are you sure you want to leave Bamboo App and go to Recharge?"
            open={ this.state.openAlert }
            confirmContent="Continue"
            onConfirm={() => {
                window.open(this.state.modalUrl, '_blank').focus();
                this.setState({ openAlert: false })
              }
            }
          >
            There are advanced features in Recharge that aren't fully documented in our User Doc.
            Please contact us if you have any questions.
          </Alert>
        </Page>
      </EmbeddedApp>
      </div>
    );
  }

  searchUpdated (term) {
    this.setState({ searchTerm: term })
  }
}
export default Subscription
