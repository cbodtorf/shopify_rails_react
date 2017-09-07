import React from 'react';
import {Page, Card, Stack, FormLayout, Select, Layout, Button, Icon, Thumbnail, TextStyle, TextField, Subheading, Avatar, Tabs, Link} from '@shopify/polaris';
import {EmbeddedApp, Alert, Bar} from '@shopify/polaris/embedded';

import Navigation from '../../Global/components/Navigation';
import bambooIcon from 'assets/green-square.jpg';

import NoteFormElement from './NoteFormElement'

import uuid from 'uuid'

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

class OrderEditor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      datePickerMonth: new Date().getMonth(),
      datePickerYear: new Date().getUTCFullYear(),
      datePickerSelected: null,
      order: {},
      method: '',
      url: '',
      deleteAlertOpen: false,
    }
  }

  componentWillMount() {
    console.log("this", this);

    this.setState({
      order: this.props.order,
    })
  }

  render() {
    const customer = this.props.order.customer
    const sourceName = this.props.order.tags.split(', ').indexOf('Subscription') !== -1 ?
      "ReCharge Recurring Billing & Subscriptions (via import)" :
      this.props.order.source_name.split('_').join(' ');

    const shippingAddress = this.props.order.shipping_address
    const products = this.props.order.line_items
    const urlBase = 'https://bamboojuices.myshopify.com/admin/'
    console.log("render", this.state);

    const noteAttributes = this.props.order.note_attributes.map((note, i) => {
      return (
        <NoteFormElement
          key={ `${i}_${note.value}` }
          noteAttribute={ note }
          datePickerMonth={ this.state.datePickerMonth }
          datePickerYear={ this.state.datePickerYear }
          datePickerSelected={ this.state.datePickerSelected }
          pickupLocations={ this.props.pickupLocations }
          rates={ this.props.rates }
        />
      )
    })

    const lineItems = products.map((item, i) => {

      let itemProps = item.properties.map((prop, idx) => {
        {/* TODO: charge_on_day_of_week: should be a hidden */}
        {/* TODO: shipping_interval_frequency: should be hidden */}
        {/* TODO: shipping_interval_unit_type: should be hidden */}

        return (
          <Stack key={ `${item.id} _ ${idx}` } distribution="leading" alignment="center">
            <Stack.Item fill>
              <TextField prefix={ <TextStyle variation="subdued">{ prop.name + ": " }</TextStyle> } value={ prop.value } />
            </Stack.Item>
            <Stack.Item >
              <Link onClick={ () => { console.log('delete') } } ><Icon source="delete" color="inkLightest"/></Link>
            </Stack.Item>
          </Stack>
        )
      })

      return (
        <Card.Section key={ item.id }>
          <Stack distribution="leading" alignment="center">
            <Stack.Item>
              <Thumbnail
                source={ item.image.src }
                size="medium"
                alt={ item.title }
              />
            </Stack.Item>
            <Stack.Item fill>
              <Link external="true" url={ `${urlBase}product/${item.id}` }>{ item.title }</Link><br />
              <TextStyle variation="subdued">{ item.sku }</TextStyle>
            </Stack.Item>
            <Stack.Item>
              <p>{ `$${item.price} x ${item.quantity}` }</p>
            </Stack.Item>
            <Stack.Item>
              <p>{ '$' + (Number(item.price) * item.quantity).toFixed(2) }</p>
            </Stack.Item>
          </Stack>
          <br/>
          { itemProps }

        </Card.Section>
      )
    })

    return (
      <EmbeddedApp
        apiKey={ this.props.apiKey }
        shopOrigin={ this.props.shopOrigin }
        forceRedirect={ true }
      >
        <Page icon={ bambooIcon }>
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={ null }/>
            </Layout.Section>

            <Layout.Section>
                <Card
                  title="Order Details"
                  actions={ [{ content:
                    <p>
                      <TextStyle variation="subdued">{`from `}</TextStyle>
                      <TextStyle variation="subdued">
                        <strong>
                          { toTitleCase(sourceName) }
                        </strong>
                      </TextStyle>
                    </p>
                  }] }
                  primaryFooterAction={{ content: 'Save', onAction: () => { this.handleSave() } }}
                  secondaryFooterAction={{ content: 'Cancel', onAction: () => { this.handleCancel() } }}
                  >
                  <Card.Section>
                    <Subheading>{ this.props.order.fulfillment_status !== null ? this.props.order.fulfillment_status : 'Unfulfilled' }</Subheading>
                  </Card.Section>

                  <Card.Section>
                    { lineItems }<br /><br />

                    <Layout>
                      <Layout.Section>
                        <TextField placeholder="Add a note to this order..." label={ <TextStyle variation="subdued">{ `Note` }</TextStyle> } value={ this.props.order.note || '' } />
                      </Layout.Section>

                      <Layout.Section secondary>
                        <Stack distribution="equalSpacing">
                          <Stack.Item><TextStyle variation="subdued">{ `Subtotal` }</TextStyle></Stack.Item>
                          <Stack.Item>$ { this.props.order.subtotal_price }</Stack.Item>
                        </Stack>
                        <Stack distribution="equalSpacing">
                          <Stack.Item><TextStyle variation="subdued">{ `Shipping` }</TextStyle></Stack.Item>
                          <Stack.Item>$ { this.props.order.shipping_lines[0].price }</Stack.Item>
                        </Stack>
                        <Stack distribution="equalSpacing">
                          <Stack.Item><TextStyle variation="strong">{ `Total ` }</TextStyle></Stack.Item>
                          <Stack.Item><TextStyle variation="strong">{ `$${ this.props.order.total_price_usd }` }</TextStyle></Stack.Item>
                        </Stack>
                      </Layout.Section>
                    </Layout>
                  </Card.Section>

                  <Card.Section
                    title="Accept Payment"
                    primaryFooterAction={{content: 'Capture Payment', onAction: () => { this.handleSave() } }}
                    >
                  </Card.Section>
                  <Card.Section
                    title="2 items to Fulfill"
                    primaryFooterAction={{content: 'Start Fulfilling', onAction: () => { this.handleSave() } }}
                    >
                  </Card.Section>
                </Card>
            </Layout.Section>
            <Layout.Section secondary>
              <div className="customer">
                <Card
                  title="Customer"
                  actions={[{
                    content:
                      <Avatar
                        customer
                        name={ `${customer.first_name} ${customer.last_name}` }
                        size="small"
                      />
                  }]}
                >
                <Card.Section>
                  <Link external="true" url={ `${urlBase}customers/${customer.id}` }>{ `${customer.first_name} ${customer.last_name}` }</Link><br />
                  <Link external="true" url={ `${urlBase}orders/?customer_id=${customer.id}` }>{ customer.orders_count } orders</Link>
                </Card.Section>
                  <Card.Section
                    title="Order Contact"
                    >
                    <TextStyle variation="subdued">{ customer.email }</TextStyle>
                  </Card.Section>
                  <Card.Section
                    title="Shipping Address"
                    >
                    <TextStyle variation="subdued">
                      { shippingAddress.name }<br />
                      { shippingAddress.company }<br />
                      { shippingAddress.address1 }<br />
                      { shippingAddress.address2 }<br />
                      { `${shippingAddress.city} ${shippingAddress.province_code} ${shippingAddress.zip}` }<br />
                      { shippingAddress.country }
                      <br /><br />
                      <Link external="true" url={ `https://maps.google.com/?q=${shippingAddress.latitude},${shippingAddress.longitude}&t=h&z=17` }>View map</Link>
                    </TextStyle>
                  </Card.Section>
                </Card>
              </div>
              <div className="note-attributes">
                <Card
                  sectioned
                  title="Additonal Details"
                >
                  { noteAttributes }
                </Card>
              </div>
            </Layout.Section>
          </Layout>
          <Alert
            title="Delete Delivery Rate?"
            open={this.state.deleteAlertOpen}
            confirmContent="Delete"
            onConfirm={() => {
              this.handleDelete(this.state.rateToDelete).bind(this)
              this.setState({deleteAlertOpen: false, rateToDelete: null})
              }}
            cancelContent="Continue editing"
            onCancel={() => this.setState({deleteAlertOpen: false})}
          >
            Are you sure you want to delete this rate?
          </Alert>
        </Page>
      </EmbeddedApp>
    );
  }

  valueUpdater(field) {
    return (value) => this.setState({ rate: { ...this.state.rate, [field]: value } });
  }

  handleSave() {

    this.rateForm.submit()
  }

  handleCancel() {
    window.location = '/'
  }

  handleEdit(rate) {
    let method = 'post'
    let url = `/rates/`
    let windowUrl = '/rates/'
    let title = 'new'
    let newRate = true
    let conditions = []

    if (rate) {
      console.log('what?', rate);
      method = 'patch'
      url = `/rates/${rate.id}`
      windowUrl = `/rates?id=${rate.id}`
      title = rate.title
      newRate = false
      conditions = rate.conditions
      rate = rate
    } else {
      rate = {}
    }

    this.setState({
      rate: rate,
      method: method,
      url: url,
      newRate: newRate,
      conditions: conditions
    })

    if (history.pushState) {
      history.pushState('', title, windowUrl);
    }
  }

  handleDelete(rate) {
    let self = this
    $.ajax({
       type: "DELETE",
       url: `/rates/${rate.id}`,
       success: function (result) {
         self.setState({
           rate: {},
           method: 'post',
           url: '/rates/',
           newRate: true
         })
       },
       error: function (){
         window.alert("something wrong!");
       }
    });
  }



}
export default OrderEditor
