import React, {Component} from 'react';
import {
  Layout,
  Page,
  Stack,
  FooterHelp,
  Card,
  Link,
  Button,
  ButtonGroup,
  Tag,
  Icon,
  Badge,
  FormLayout,
  TextField,
  AccountConnection,
  ChoiceList,
  SettingToggle,
} from '@shopify/polaris';

class Rate extends Component {
  constructor(props, railsContext) {
    super(props)

    console.log('rate', this.props.rateData);
    this.state = {}
  }

  render() {
    return (
      <Card
        actions={[{
          content:
          <ButtonGroup segmented>
            <Button size="slim" url={"/rates/" + this.props.rateData.id}>Edit</Button>
            <a rel="nofollow" data-confirm="Delete 'Store Pickup'?" data-method="delete" href={"/rates/" + this.props.rateData.id}>
              <Button destructive icon="delete" size="slim" accessibilityLabel="delete rate"/>
            </a>
          </ButtonGroup>
        }]}
        title={ this.props.rateData.name }
        subdued
        sectioned
      >
      <Badge status="info">{`${this.props.rateData.price / 100.0} ${this.props.shop.currency}`}</Badge>
      </Card>
    );
  }
}

export default Rate
