import React from 'react';
import {
  Layout,
  Page,
  Stack,
  FooterHelp,
  Card,
  Link,
  Button,
  Tag,
  Icon,
  Badge,
  Banner,
  FormLayout,
  TextField,
  AccountConnection,
  ChoiceList,
  SettingToggle,
} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';
import Rate from './Rate'

class Home extends React.Component {
  constructor(props) {
    super(props);

    console.log('rates', this.props.rates);
    this.state = {
      first: '',
      last: '',
      email: '',
      checkboxes: [],
      connected: false,
      rates: this.props.rates
    };
  }

  render() {
    const products = this.props.products.map((product, i) => {
      return (
        <Card
          key={i}
          title={product.title}
          primaryFooterAction={{content: 'check it out', url: `https://${this.props.shop_session.url}/admin/products/${product.id}`}}
          sectioned
        >
          <p>View a summary of {product.title}</p>
        </Card>
      );
    })

    const breadcrumbs = [
      {content: 'Example apps'},
      {content: 'Apps'},
    ];
    const primaryAction = {content: 'Help', url: '/help'};
    const secondaryActions = [{content: 'Import', icon: 'import'}];

    console.log("props",this.props);
    return (
      <EmbeddedApp
        apiKey={this.props.apiKey}
        shopOrigin={this.props.shopOrigin}
      >
        <Page
        title={`Home`}
        
        primaryAction={primaryAction}
        secondaryActions={secondaryActions}
        >
          <a href="/error">error</a><br />
          <a href="/onboarding">onboarding</a>
          <Layout>
            <Layout.AnnotatedSection
              title="Dashboard"
              description="Up-to-date Order and Customer information."
            >
              <SettingToggle
                action={{
                  content: 'Dashboard', url: '/dashboard',
                }}
              >
                Upload your store’s logo, change colors and fonts, and more.
              </SettingToggle>
            </Layout.AnnotatedSection>

           {this.renderRates()}
           {this.renderBundles()}

            <Layout.Section>
              <FooterHelp>For more details on Bamboo, visit our site:<Link url="https://polaris.shopify.com"> E4 Consulting</Link>.</FooterHelp>
            </Layout.Section>

          </Layout>
        </Page>
      </EmbeddedApp>
    );
  }
  valueUpdater(field) {
    return (value) => this.setState({[field]: value});
  }
  toggleRates() {
    this.setState(({ratesView}) => ({ratesView: !ratesView}));
  }
  toggleBundles() {
    this.setState(({bundlesView}) => ({bundlesView: !bundlesView}));
  }

  showRates() {
    return (
      <Layout.AnnotatedSection
        title="Delivery Rates"
        description="Create custom rules to simplify complex shipping requirements."
      >
        <AccountConnection
          action={{
            content: 'Manage Rates',
            onAction: this.toggleRates.bind(this, this.state),
          }}
          details={<div><Badge status="info">{this.state.rates.length}</Badge> Rates</div>}
          termsOfService={<p>Learn about adding custom Delivery Rates at <Link url="https://polaris.shopify.com">Bamboo Support</Link>.</p>}
        />
      </Layout.AnnotatedSection>
    );
  }

  hideRates() {
    const self = this
    let rates = this.state.rates.map((rate) => {
      return (
        <Rate key={rate.id} rateData={rate} shop={self.props.shop}/>
      );
    })

    return (
      <Layout.AnnotatedSection
          title="Delivery Rates"
          description="Create custom rules to simplify complex shipping requirements."
        >
        <AccountConnection
          action={{
            content: 'Hide Rates',
            onAction: this.toggleRates.bind(this, this.state),
          }}
          details={<div><Badge status="info">{this.state.rates.length}</Badge> Rates</div>}
          termsOfService={<p>Learn about adding custom Delivery Rates at <Link url="https://polaris.shopify.com">Bamboo Support</Link>.</p>}
        />

        {rates}

      </Layout.AnnotatedSection>
    );
  }

  showBundles() {
    return (
      <Layout.AnnotatedSection
        title="Bundles"
        description="Curate and group product that belong together."
      >
        <AccountConnection
          action={{
            content: 'Manage Bundles',
            onAction: this.toggleBundles.bind(this, this.state),
          }}
          details={<div><Badge status="info">4</Badge> Bundles</div>}
          termsOfService={<p>Learn about adding custom Bundles at <Link url="https://polaris.shopify.com">Bamboo Support</Link>.</p>}
        />
      </Layout.AnnotatedSection>
    );
  }

  hideBundles() {
    return (

      <Layout.AnnotatedSection
        title="Bundles"
        description="Curate and group product that belong together."
        sectioned
        >
        <AccountConnection
          action={{
            content: 'Hide Bundles',
            onAction: this.toggleBundles.bind(this, this.state),
          }}
          details={<div><Badge status="info">4</Badge> Bundles</div>}
          termsOfService={<p>Learn about adding custom Bundles at <Link url="https://polaris.shopify.com">Bamboo Support</Link>.</p>}
        />
        <AccountConnection
          connected
          action={{
            content: 'Edit',
            onAction: this.toggleBundles.bind(this, this.state),
          }}
          accountName="Cleanse"
          title={<Link url="http://google.com">The Beginner - 3 Day Cleanse</Link>}
          termsOfService={
            <div>
              <Badge>Coconut Almond Milk</Badge>
              <Badge>Spinach Apple</Badge>
              <Badge>Lemon Ginger</Badge>
              <Badge>Beet Cucumber</Badge>
              <Badge>Cinnamon Yam</Badge>
              <Badge>Carrot Coconut</Badge>
              <Badge>Sweet Celery</Badge>
            </div>
          }
        />
        <AccountConnection
          connected
          action={{
            content: 'Edit',
            onAction: this.toggleBundles.bind(this, this.state),
          }}
          accountName="Cleanse"
          title={<Link url="http://google.com">The Organ Cleanse - 1 Day Cleanse</Link>}
          termsOfService={
            <div>
              <Badge>Psyllium Husk Apple</Badge>
              <Badge>Spinach Apple</Badge>
              <Badge>Seasonal Greens</Badge>
              <Badge>Spiced Yam</Badge>
              <Badge>Carrot Coconut</Badge>
              <Badge>Vanilla Mint Almond Milk</Badge>
            </div>
          }
        />
        <AccountConnection
          connected
          action={{
            content: 'Edit',
            onAction: this.toggleBundles.bind(this, this.state),
          }}
          accountName="Kit"
          title={<Link url="http://google.com">The Feel Better</Link>}
          termsOfService={
            <div>
              <Badge>Feel Better Elixir</Badge>
              <Badge>Lemon Ginger</Badge>
              <Badge>Dandelion</Badge>
              <Badge>Beet Cucumber</Badge>
            </div>
          }
        />
        <AccountConnection
          connected
          action={{
            content: 'Edit',
            onAction: this.toggleBundles.bind(this, this.state),
          }}
          accountName="Kit"
          title={<Link url="http://google.com">Energy</Link>}
          termsOfService={
            <div>
              <Badge>Deep Chocolate</Badge>
              <Badge>Coffee Almond</Badge>
              <Badge>Dandelion</Badge>
              <Badge>Feel Better Elixir</Badge>
            </div>
          }
        />
      </Layout.AnnotatedSection>

    );
  }

  renderRates() {
    return this.state.ratesView
      ? this.hideRates()
      : this.showRates();
  }
  renderBundles() {
    return this.state.bundlesView
      ? this.hideBundles()
      : this.showBundles();
  }


}
export default Home
