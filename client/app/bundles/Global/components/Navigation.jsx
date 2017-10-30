import React from 'react';
import { Tabs, Card, Button, Popover, ActionList, Link } from '@shopify/polaris';

class Navigation extends React.Component {
  constructor(props) {
    super(props)

  }

  componentWillMount() {
    this.setState({
      popOverActive: false,
    })
  }
  render() {
    return (
      <div className="Navigation__Bamboo">
          <Tabs
            selected={ this.props.selectedTab !== null ? this.props.selectedTab : 3 }
            fitted={ false }
            tabs={ [
              {
                id: 'dashboard',
                title: 'Dashboard',
                panelID: 'dashboard',
                url: `/dashboard?shop=${this.props.shop}`,
              },
              {
                id: 'subscriptions',
                title: 'Subscriptions',
                panelID: 'subscriptions',
                url: `/subscription?shop=${this.props.shop}`,
              },
              {
                id: 'errors',
                title: 'Errors',
                panelID: 'errors',
                url: `/showOrders?attribute=errors&date=${new Date().toDateString()}&shop=${this.props.shop}`,
              },
              {},
            ] }
          >
            <Popover
              active={this.state.popOverActive}
              sectioned
              activator={
                <li onClick={this.togglePopOver.bind(this)} role="presentation" className="Polaris-Tabs__TabContainer">
                  <a id="settings" role="tab" tabIndex="-1" className="Polaris-Tabs__Tab" aria-selected="false" aria-controls="bundles" data-polaris-unstyled="true">
                    <span className="Polaris-Tabs__Title">
                      Settings
                    </span>
                  </a>
                </li>
              }
              onClose={ this.togglePopOver.bind(this) }
            >
              <ActionList
                items={ [
                  { content: 'Rates', url: `/rates?shop=${this.props.shop}` },
                  { content: 'Blackout Dates', url: `/blackout_dates?shop=${this.props.shop}` },
                  { content: 'Pickup Locations', url: `/pickup_locations?shop=${this.props.shop}` },
                  { content: 'Postal Codes', url: `/postal_codes?shop=${this.props.shop}` },
                  { content: 'Bundles', url: `/bundle?shop=${this.props.shop}`},
                  { content: 'Benefits & Ingredients', url: `/metafield?shop=${this.props.shop}` },
                ] }
              />
            </Popover>
          </Tabs>
      </div>
    );
  }

  togglePopOver() {
    let self = this;
    console.log('this', this);
    this.setState({
      popOverActive: !self.state.popOverActive,
    })
  }
}

export default Navigation
