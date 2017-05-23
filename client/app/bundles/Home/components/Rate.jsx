import React, {Component} from 'react';
import {
  Card,
  Link,
  Button,
  ButtonGroup,
  Icon,
  Badge,
} from '@shopify/polaris';

class Rate extends Component {
  constructor(props, railsContext) {
    super(props)

    console.log('rate', this.props.rateData);
    this.state = {}
  }

  render() {
    return (
      <Card.Section
        title={ `${this.props.rateData.name} - ${this.props.rateData.price / 100.0} ${this.props.shop.currency}` }
        subdued
      >
        <div style={{float: 'right'}}>
          <ButtonGroup segmented>
            <Button size="slim" url={"/rates?id=" + this.props.rateData.id}>Edit</Button>
            <a rel="nofollow" data-confirm="Delete 'Store Pickup'?" data-method="delete" href={"/rates/" + this.props.rateData.id}>
              <Button destructive icon="delete" size="slim" accessibilityLabel="delete rate"/>
            </a>
          </ButtonGroup>
        </div>
        <p>{this.props.rateData.description}</p>
      </Card.Section>
    );
  }
}

export default Rate
