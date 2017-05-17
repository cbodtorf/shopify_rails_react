import React, {Component} from 'react';
import {
  Card,
  Link,
  Button,
  ButtonGroup,
  Icon,
  Badge,
} from '@shopify/polaris';

class Bundle extends Component {

  render() {
    let products = []
    if(this.props.bundleData.metafields !== null) {
      products = this.props.bundleData.metafields.value.split(',').map((product, i) => {
        return (
          <Badge key={i}>{product}</Badge>
        )
      })
    } else {
      products = <Badge status="attention" >No product attached to this bundle</Badge>
    }

    return (
      <Card.Section
        title={ `${this.props.bundleData.title}` }
        subdued
      >
        <div style={{float: 'right'}}>
          <ButtonGroup segmented>
            <Button size="slim" url={"/bundles/" + this.props.bundleData.id}>Edit</Button>
            <a rel="nofollow" data-confirm="Delete?" data-method="delete" href={"/bundles/" + this.props.bundleData.id}>
              <Button destructive icon="delete" size="slim" accessibilityLabel="delete bundle"/>
            </a>
          </ButtonGroup>
        </div>
        <br />
        { products }
      </Card.Section>
    );
  }
}

export default Bundle
