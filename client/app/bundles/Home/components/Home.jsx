import React from 'react';
import {
  Layout,
  Page,
  FooterHelp,
  Card,
  Stack,
  Link,
  Button,
  Icon,
  Badge,
  Banner,
  TextField,
  AccountConnection,
} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';
import Rate from './Rate'
import Bundle from './Bundle'

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      connected: false,
      rates: []
    };
  }

  componentWillMount() {

    this.setState({rates: this.props.rates});

  }

  render() {

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

          <Layout>
            <Layout.Section>
              <Banner
                status="warning"
                title="These are some links for testing routes."
              >
                <a href="/error">error</a><br />
                <a href="/onboarding">onboarding</a>
              </Banner>
            </Layout.Section>

            <Layout.AnnotatedSection
              title="Dashboard"
              description={
                <div>
                  <p>Info on orders, customers, etc!</p>
                  <Button primary url={'/dashboard'}>Dasboard</Button>
                </div>
              }
            >
              <Card>
                <Stack>
                  <Card.Section sectioned title="Juices to Cook">
                    <h1  className="Polaris-DisplayText--sizeLarge">341</h1>
                  </Card.Section>
                  <Card.Section sectioned title="New Orders">
                    <h1 className="Polaris-DisplayText--sizeLarge">136</h1>
                  </Card.Section>
                  <Card.Section sectioned title="New Customers">
                    <h1 className="Polaris-DisplayText--sizeLarge">23</h1>
                  </Card.Section>
                  <Card.Section sectioned title="Today's Revenue">
                    <h1 className="Polaris-DisplayText--sizeLarge">$2,392</h1>
                  </Card.Section>
                </Stack>
              </Card>
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
        description={
          <div>Create custom rules to simplify complex shipping requirements.
          <br />
          <Link url="/rates">Add new Rate.</Link>
          </div>
        }
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

        <Card>{rates}</Card>

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
          details={<div><Badge status="info">{this.props.bundles.length}</Badge> Bundles</div>}
          termsOfService={<p>Learn about adding custom Bundles at <Link url="https://polaris.shopify.com">Bamboo Support</Link>.</p>}
        />
      </Layout.AnnotatedSection>
    );
  }

  hideBundles() {
    const self = this
    const bundles = this.props.bundles.map((bundle, i) => {
      return (
        <Bundle key={bundle.id} bundleData={bundle} shop={self.props.shop} />
      )
    })
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
          details={<div><Badge status="info">{this.props.bundles.length}</Badge> Bundles</div>}
          termsOfService={<p>Learn about adding custom Bundles at <Link url="https://polaris.shopify.com">Bamboo Support</Link>.</p>}
        />
          <Card>{ bundles }</Card>
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
