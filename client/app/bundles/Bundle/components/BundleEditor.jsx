import React from 'react';
import {Page, Card, Banner, FormLayout, Select, TextField, Layout, Button, Icon, ResourceList, Thumbnail, TextStyle, Tabs, Badge} from '@shopify/polaris';
import {EmbeddedApp, Modal} from '@shopify/polaris/embedded';
import Navigation from '../../Global/components/Navigation';
import bambooIcon from 'assets/green-square.jpg';

class BundleEditor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      bundleItems: [],
      modalOpen: false,
      bundleToEdit: this.props.bundles[0]
    }
  }

  componentWillMount() {
    console.log("props", this.props);

    this.setState({
      bundleItems: this.props.bundles,
    })
  }



  render() {
    console.log("render", this);
    let bundlesItems = this.state.bundleItems.map(bundle => {
      return (
        {
          url: `https://bamboojuices.myshopify.com/admin/products/${bundle.id}`,
          media: <Thumbnail
            source={bundle.image ? bundle.image.src : ''}
            alt={bundle.image ? bundle.image.alt : ''}
          />,
          attributeOne: bundle.title,
          attributeTwo: <div className="resource-badge">{
            bundle.metafield.map((item, i) => {
              return (
                <Badge key={i} status="default">{item.title + ' x' + item.quantity}</Badge>
              )
          })
        }</div>,
          actions: [{content: 'Edit listing', onAction: () => {
              this.setState({modalOpen: true})
              this.setState({bundleToEdit: bundle})
            }
          }],
          persistActions: true,
        }
      )
    })

    let mainContainer = (
        <Card
          sectioned
          title={"Welcome"}
          primaryFooterAction={{content: 'New', onAction: () => { window.open('https://bamboojuices.myshopify.com/admin/products/new', '_blank').focus() } }}
          secondaryFooterAction={{content: 'Cancel', onAction: () => { this.handleCancel() } }}
          >
          <div>
            In order to create a bundle and add product to it, The listing must have a tag called 'bundle'.
            <br />
            The next step is to choose it from the list below.
            <br />
            Once selected, bundle items can be added, and product can be selected from a drop down menu.
          </div>
        </Card>
      )

    return (
      <EmbeddedApp
        apiKey={this.props.apiKey}
        shopOrigin={this.props.shopOrigin}
        forceRedirect={true}
      >
        <Page
          title={`Edit Bundle`}
          icon={bambooIcon}
          primaryAction={{content: 'New Product', onAction: () => { window.open('https://bamboojuices.myshopify.com/admin/products/new', '_blank').focus() } }}
          fullWidth
          >
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={2}/>
            </Layout.Section>
            <Layout.Section>
              {mainContainer}

                <Card
                  title="Other Bundles"
                >
                  <ResourceList
                    items={bundlesItems}
                    renderItem={(item, index) => {
                      return <ResourceList.Item key={item.id} {...item} />;
                    }}
                  />
                </Card>
            </Layout.Section>
          </Layout>
          <Modal
            src={`/modal_form?id=${this.state.bundleToEdit.id}`}
            open={this.state.modalOpen}
            title={`Edit ${this.state.bundleToEdit.title}`}
            onClose={() => {
              this.setState({modalOpen: false})
              this.refreshBundle(this.state.bundleToEdit.id)
            }}
          />
        </Page>
      </EmbeddedApp>
    );
  }

  handleCancel() {
    window.location = '/'
  }

  refreshBundle(id) {
    const self = this
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let myInit = { method: 'GET',
               headers: myHeaders,
               credentials: 'same-origin',
               mode: 'cors',
               cache: 'default' };

    fetch(`/get_bundle?id=${id}`, myInit) // Call the fetch function passing the url of the API as a parameter
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) {
        // Your code for handling the data you get from the API
        console.log("fetch data", data)
        console.log("fetch data", self.state.bundleItems)
        let newState = self.state.bundleItems.map(bundle => {
          return Number(data.bundle.id) === Number(bundle.id) ?
            data.bundle :
            bundle;
        })
        self.setState({
          bundleItems: newState,
        })
    })
    .catch(function(error) {
        // This is where you run code if the server returns any errors
        console.error('Hmm something went wrong:', error)
    });
  }

}
export default BundleEditor
