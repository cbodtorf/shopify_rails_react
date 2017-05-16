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
    const juices = this.props.bundleData.juice_ids.map(juice => {
      return (
        <Badge key={juice}>juice</Badge>
      )
    })

    return (
      <Card.Section
        title={ `${this.props.bundleData.name}` }
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
        <p>{this.props.bundleData.description}</p>
        { juices }
      </Card.Section>
    );
  }
}

export default Bundle
