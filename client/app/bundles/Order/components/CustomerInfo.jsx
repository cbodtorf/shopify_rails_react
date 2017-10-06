import React from 'react';
import { Card, Stack, Button, Icon, TextStyle, Avatar, Link } from '@shopify/polaris';



class CustomerInfo extends React.Component {
  constructor(props) {
    super(props)

  }

  componentWillMount() {
    console.log("this", this);
  }

  render() {
    const customer = this.props.customerInfo
    const shippingAddress = this.props.shippingAddress ? this.props.shippingAddress : customer.default_address
    console.log('this.props.shippingAddress', this.props.shippingAddress);
    console.log('customer.default_address', customer.default_address);
    const urlBase = this.props.urlBase

    return (
      <div className="customer">
        <Card
          title="Customer"
          actions={ [ {
            content:
              <Avatar
                customer
                name={ `${customer.first_name} ${customer.last_name}` }
                size="small"
              />
          } ] }
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
    );
  }

}
export default CustomerInfo
