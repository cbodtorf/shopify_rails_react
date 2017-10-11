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
            selected={this.props.selectedTab !== null ? this.props.selectedTab : 3}
            fitted={false}
            tabs={[
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
                id: 'bundles',
                title: 'Bundles',
                panelID: 'bundles',
                url: `/bundle?shop=${this.props.shop}`,
              },
              {
                id: 'metafields',
                title: 'Metafields',
                panelID: 'metafields',
                url: `/metafield?shop=${this.props.shop}`,
              },
              {},
            ]}
          >
            <Popover
              active={this.state.popOverActive}
              sectioned
              activator={<li onClick={this.togglePopOver.bind(this)} role="presentation" className="Polaris-Tabs__TabContainer"><a id="settings" role="tab" tabIndex="-1" className="Polaris-Tabs__Tab" aria-selected="false" aria-controls="bundles" data-polaris-unstyled="true"><span className="Polaris-Tabs__Title">Settings</span></a></li>}
              onClose={this.togglePopOver.bind(this)}
            >
              <ActionList
                items={[
                  {content: 'Rates', url: '/rates'},
                  {content: 'Blackout Dates', url: '/blackout_dates'},
                  {content: 'Pickup Locations', url: '/pickup_locations'},
                  {content: 'Postal Codes', url: '/postal_codes'},
                ]}
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
