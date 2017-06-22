import React from 'react';
import {Page, Card, Banner, FormLayout, Select, Layout, Button, Icon, ResourceList, Thumbnail, TextStyle, Tabs} from '@shopify/polaris';
import {EmbeddedApp} from '@shopify/polaris/embedded';

class BundleEditor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      bundle: {},
      bundleItems: [],
      formFields: [],
      hiddenFormInput: '',
      method: '',
      url: ''
    }
  }

  componentWillMount() {
    console.log("props", this.props);
    let metafield = []
    let method = 'post'
    let url = this.props.bundle === null ? '/bundle' : `/bundle?id=${this.props.bundle.id}`

    let bundleItems = this.props.bundles.map(bundle => {
      return (
        {
          url: bundle.url,
          media: <Thumbnail
            source={bundle.image.src}
            alt={bundle.image.alt}
          />,
          attributeOne: bundle.title,
          attributeTwo: <TextStyle variation="subdued">{`${bundle.metafield.length} associated products`}</TextStyle>,
          actions: [{content: 'Edit listing', onAction: () => { this.handleEdit(bundle) }}],
          persistActions: true,
        }
      )
    })
    if (this.props.bundle) {
      if (this.props.bundle.metafield.length !== 0) {
        method = 'put'
        url = `/bundle/${this.props.bundle.id}`
      }
    }

    this.setState({
      bundle: this.props.bundle,
      bundleItems: bundleItems,
      formFields: this.props.bundle === null ? '' : this.props.bundle.metafield,
      method: method,
      url: url
    })
  }



  render() {
    const productOptions = this.props.products.filter(product => {
      /**
      * @TODO: need a stricter filter for removing unwanted product like auto renew and bundles.
      */
      return product.product_type !== 'bundle' && product.title.toLowerCase().indexOf('auto') === -1
    }).map(product => {
      return product.title
    })


    let existingMetafields = []
    console.log('state', this.state);
    if (this.state.formFields.length !== 0 ) {
      existingMetafields = this.state.formFields.map((item, i) => {
        return (
          <Select
            key={i}
            label="Bundle Item"
            value={item.title}
            options={productOptions}
            placeholder="Select"
            onChange={this.valueUpdater(item.id)}
            labelAction={{content: 'remove', onAction: () => { this.removeFormField(item.id) }}}
          />
        )
      })
    } else {
      existingMetafields = (
        <p>No associated products yet.</p>
      )
    }

    let mainContainer = ''
    if (this.state.bundle !== null) {
      mainContainer = (
        <Card
          sectioned
          title={this.state.bundle.title}
          primaryFooterAction={{content: 'Save', onAction: () => { this.handleSave() } }}
          secondaryFooterAction={{content: 'Cancel', onAction: () => { this.handleCancel() } }}
          actions={[{content: 'Add bundle item', onAction: () => { this.addFormField() } }]}
          >
        <FormLayout>
          <FormLayout.Group>
            { existingMetafields }
            <form
              action={this.state.url}
              acceptCharset="UTF-8" method="post"
              ref={(form) => {this.metaForm = form}}
              style={{'display': 'none'}}
              >
              <input name="utf8" type="hidden" value="✓" />
              <input type="hidden" name="_method" value={this.state.method} />
              <input type="hidden" name="authenticity_token" value={this.props.authenticity_token} />
              <label htmlFor="metafield">Search for:</label>
              <input type="text" name="metafield" id="metafield" value={this.state.hiddenFormInput} onChange={this.formUpdater('hiddenFormInput')} ref={(textInput) => {this.metaInput = textInput}}/>
              <input type="submit" name="commit" value="submit" data-disable-with="submit" />
            </form>
          </FormLayout.Group>
        </FormLayout>
        </Card>
      )
    } else {

      mainContainer = (
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
    }


    return (
      <EmbeddedApp
        apiKey={this.props.apiKey}
        shopOrigin={this.props.shopOrigin}
      >
        <Page title={`Edit Bundle`}>
        <Tabs
          selected={2}
          fitted
          tabs={[
            {
              id: 'dashboard',
              title: 'Dashboard',
              panelID: 'dashboard',
              url: '/dashboard',
            },
            {
              id: 'rates',
              title: 'Rates',
              panelID: 'rates',
              url: '/rates',
            },
            {
              id: 'bundles',
              title: 'Bundles',
              panelID: 'bundles',
              url: '/bundles?0',
            },
            {
              id: 'settings',
              title: 'Settings',
              panelID: 'settings',
              url: '/settings',
            },
          ]}
        />
          <Layout>
            <Layout.Section>
              {mainContainer}

                <Card
                  title="Other Bundles"
                >
                  <ResourceList
                    items={this.state.bundleItems}
                    renderItem={(item, index) => {
                      return <ResourceList.Item key={index} {...item} />;
                    }}
                  />
                </Card>
            </Layout.Section>
          </Layout>
        </Page>
      </EmbeddedApp>
    );
  }

  valueUpdater(id) {

    return (value) => {
      let metafield = this.state.formFields.map((field, i) => {
        if (field.id !== id) {
          return field
        } else {
          field.title = value
          return field
        }
        })
        this.setState({formFields: metafield})
      }

  }

  formUpdater(field) {
    return (value) => this.setState({[field]: value});
  }

  handleSave() {
    let dataString = this.state.formFields.map(field => {
      return field.title
    }).join(',')

    this.metaInput.value = dataString
    console.log('data', dataString, this.metaForm, this.metaInput.value);
    this.metaForm.submit()
  }

  handleCancel() {
    window.location = '/'
  }

  handleEdit(bundle) {
    let method = 'post'
    let url = `/bundle?id=${bundle.id}`

    if (bundle.metafield.length !== 0) {
      method = 'put'
      url = `/bundle/${bundle.id}`
    }

    this.setState({
      bundle: bundle,
      formFields: bundle.metafield,
      method: method,
      url: url
    })

    if (history.pushState) {
      history.pushState('', bundle.title, `${window.location.origin}/bundle/?id=${bundle.id}`);
    }
  }

  addFormField() {
    console.log('formFields', this.state.formFields);
    let formFields = this.state.formFields
    formFields.push({title: this.props.products[0].title, id: this.state.formFields.length + 1})

    this.setState({formFields: formFields})
  }

  removeFormField(id) {
    console.log('formFields', this.state.formFields);
    let formFields = this.state.formFields.filter(item => {
      // Remove item
      return item.id !== id
    })

    this.setState({formFields: formFields})
  }



}
export default BundleEditor
