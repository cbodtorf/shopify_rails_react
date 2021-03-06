import React from 'react';
import {Page, Card, Stack, Layout, Icon, Thumbnail, TextStyle, TextField, Subheading, DisplayText, Link} from '@shopify/polaris';
import {EmbeddedApp, Alert, Bar} from '@shopify/polaris/embedded';

import CustomerInfo from './CustomerInfo';
import Navigation from '../../Global/components/Navigation';
import ModalForm from '../../Global/components/ModalForm';
import bambooIcon from 'assets/green-square.jpg';

import NoteFormElement from './NoteFormElement';
import NoteForm from './NoteForm';

import uuid from 'uuid';

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
function formatDate(str) {
  let d = new Date(str)
  let date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()));
  let options = {
    year: "numeric", month: "long",
    day: "numeric", hour: "2-digit", minute: "2-digit"
  };
  return date.toLocaleTimeString("en-us", options).replace(/\,(?=[^,]*$)/, ' at')
}

/**
* Helps to format Dates input single d, outputs dd.
* ie. addZ(2) => '02'
*/
function addZ(n){return n<10? '0'+n:''+n;}

const weekNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

class OrderEditor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      datePickerMonth: new Date().getMonth(),
      datePickerYear: new Date().getUTCFullYear(),
      datePickerSelected: null,
      rate: null,
      checkout: null,
      location: null,
      receiveWindow: null,
      deliveryDate: {
        delivery_date: undefined,
        wday: undefined,
        day: undefined,
        month: undefined,
        year: undefined
      },
      order: this.props.order,
      method: '',
      formUrl: '',
      deleteAlertOpen: false,
      editModal: false,
    }
  }

  componentWillMount() {
    console.log("this", this);
  }

  render() {
    const urlBase = `https://${this.props.shop_session.url}/admin/`
    let customerInfo = ''

    if (this.props.order.customer) {
      customerInfo = <CustomerInfo
                        customerInfo={ this.props.order.customer ? this.props.order.customer : null }
                        shippingAddress={ this.props.order.shipping_address ? this.props.order.shipping_address : null }
                        urlBase={urlBase}
                        />
    } else {
      customerInfo = (
        <Card
          sectioned
          title="Customer"
          primaryFooterAction={{ content: 'Add Customer Info', onAction: () => { window.open(`${urlBase}orders/${this.props.order.id}`) } }}
        >
          no customer <br/><br/>
          *** can only add email and shipping information to order. <br />
        </Card>
      )
    }

    const sourceName = this.props.order.tags.split(', ').indexOf('Subscription') !== -1 ?
      "ReCharge Recurring Billing & Subscriptions (via import)" :
      this.props.order.source_name.split('_').join(' ');

    const shippingAddress = this.props.order.shipping_address
    const products = this.props.order.line_items

    console.log("render", this.state);

    const noteAttributes = this.props.order.note_attributes.map((note, i) => {
      return (
        <NoteFormElement
          key={ `${i}_${note.value}` }
          noteAttribute={ note }
          pickupLocations={ this.props.pickupLocations }
          rates={ this.props.rates }
        />
      )
    })

    const noteForm = (
        <NoteForm
          formUrl={ `/orders/${this.props.order.id}` }
          orderFormRef={ (form) => { this.orderForm = form } }
          authenticity_token={ this.props.form_authenticity_token }
          method={ 'PUT' }
          noteAttributes={ this.props.order.note_attributes }
          deliveryDate={ this.state.deliveryDate }
          datePickerMonth={ this.state.datePickerMonth }
          datePickerYear={ this.state.datePickerYear }
          datePickerSelected={ this.state.datePickerSelected }
          rate={ this.state.rate }
          onRateChange={ (value) => this.setState({rate: value}) }
          location={ this.state.location }
          receiveWindow={ this.state.receiveWindow }
          onReceiveWindowChange={ (value) => this.setState({receiveWindow: value}) }
          onLocationChange={ (value) => this.setState({location: value}) }
          checkout={ this.state.checkout }
          onCheckoutChange={ (value) => this.setState({checkout: value}) }
          pickupLocations={ this.props.pickupLocations }
          rates={ this.props.rates }
          onDateChange={ (selected) => { this.dateChange(selected) } }
          onMonthChange={ (month,year) => { this.monthChange(month,year) } }
        />
      )

    const lineItems = products.map((item, i) => {

      let itemProps = item.properties.map((prop, idx) => {
        {/* TODO: charge_on_day_of_week: should be a hidden */}
        {/* TODO: shipping_interval_frequency: should be hidden */}
        {/* TODO: shipping_interval_unit_type: should be hidden */}

        return (
          <Stack key={ `${item.id} _ ${idx}` } distribution="leading" alignment="center">
            <Stack.Item fill>
              <TextStyle variation="subdued">{ prop.name + ": " }</TextStyle>
              <TextStyle variation="default">{ prop.value }</TextStyle>
            </Stack.Item>
          </Stack>
        )
      })

      return (
        <Card.Section key={ item.id }>
          <Stack distribution="leading" alignment="center">
            <Stack.Item>
              <Thumbnail
                source={ item.image ? item.image.src : '' }
                size="small"
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

    const self = this
    const shippingLines = function() {
      if (self.props.order.shipping_lines.length > 0) {
        return (
          <Stack distribution="equalSpacing">
            <Stack.Item><TextStyle variation="subdued">{ `Shipping` }</TextStyle></Stack.Item>
            <Stack.Item>$ { self.props.order.shipping_lines[0].price }</Stack.Item>
          </Stack>
        )
      }
    }

    return (
      <EmbeddedApp
        apiKey={ this.props.apiKey }
        shopOrigin={ this.props.shopOrigin }
        forceRedirect={ true }
      >
        <Page
          icon={ bambooIcon }
          primaryAction={ {
            content: 'View Shopify Order Page',
            url: (urlBase + "/orders/" + this.props.order.id),
          } }
          >
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={ null } shop={this.props.shop_session.url}/>
            </Layout.Section>

            <Layout.Section>
              <DisplayText size="large">
                { this.props.order.name }
                <span className="title-meta">
                  <TextStyle variation="subdued">
                    { formatDate(this.props.order.created_at) }
                  </TextStyle>
                </span>
              </DisplayText>
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
                  >
                  <Card.Section>
                    <Subheading>{ this.props.order.fulfillment_status !== null ? this.props.order.fulfillment_status : 'Unfulfilled' }</Subheading>
                  </Card.Section>

                  <Card.Section>
                    { lineItems }<br /><br />

                    <Layout>
                      <Layout.Section>
                        <TextField readOnly placeholder="No notes on this order." label={ <TextStyle variation="subdued">{ `Note` }</TextStyle> } value={ this.props.order.note || '' } />
                      </Layout.Section>

                      <Layout.Section secondary>
                        <Stack distribution="equalSpacing">
                          <Stack.Item><TextStyle variation="subdued">{ `Subtotal` }</TextStyle></Stack.Item>
                          <Stack.Item>$ { this.props.order.subtotal_price }</Stack.Item>
                        </Stack>
                        { shippingLines() }
                        <Stack distribution="equalSpacing">
                          <Stack.Item><TextStyle variation="strong">{ `Total ` }</TextStyle></Stack.Item>
                          <Stack.Item><TextStyle variation="strong">{ `$${this.props.order.total_price_usd}` }</TextStyle></Stack.Item>
                        </Stack>
                      </Layout.Section>
                    </Layout>
                  </Card.Section>
                </Card>
            </Layout.Section>
            <Layout.Section secondary>

              { customerInfo }

              <div className="note-attributes">
                <Card
                  sectioned
                  title="Additonal Details"
                  primaryFooterAction={ { content: 'Edit', onAction: () => {
                    this.setState({
                      editModal: true
                    })
                  } } }
                >
                  <Stack vertical distribution="equalSpacing">
                    { noteAttributes.length > 0 ? noteAttributes : <span>Need to add delivery information.</span>  }
                  </Stack>

                </Card>
              </div>
            </Layout.Section>
          </Layout>
          <ModalForm
            open={ this.state.editModal }
            onClose={ () => this.setState({ editModal: false }) }
            onSave={ () => this.handleSave(this.orderForm) }
            title="Additional Details"
          >

            { noteForm }

          </ModalForm>
        </Page>
      </EmbeddedApp>
    );
  }

  valueUpdater(field) {
    return (value) => this.setState({ rate: { ...this.state.rate, [field]: value } });
  }

  handleSave(form) {

    form.submit()
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

  monthChange(month, year) {

    this.setState({
      datePickerMonth: month,
      datePickerYear: year
    })
  }

  dateChange(selected) {

    let d = selected.end
    this.setState({
      datePickerSelected: d,
      deliveryDate: {
        delivery_date: d,
        wday: weekNames[d.getDay()],
        day: addZ(d.getDate()),
        month: addZ(d.getMonth() + 1),
        year: d.getFullYear()
      }
    })
  }

}
export default OrderEditor
