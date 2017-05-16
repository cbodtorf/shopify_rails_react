import React from 'react';
import {Card, Link, TextField} from '@shopify/polaris';


class Order extends React.Component {

  render() {
    const createdAt = new Date(this.props.orderData.created_at)
    console.log(this.props.orderData);

    return (
      <Card.Section>
        <Link
          url={`${this.props.shopOrigin}/admin/orders/${this.props.orderData.id}`}
          external={true}
        >
          <p>{this.props.orderData.name}</p>
        </Link>
        <p>{createdAt.toDateString()}</p>
      </Card.Section>
    );
  }
}
export default Order
