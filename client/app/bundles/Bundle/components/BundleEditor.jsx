import React from 'react';
import {Page, Card, Banner, FormLayout, Select, TextField, Layout, Button, Icon, ResourceList, Thumbnail, TextStyle, Tabs, Badge} from '@shopify/polaris';
import {EmbeddedApp, Modal} from '@shopify/polaris/embedded';
import Navigation from '../../Global/components/Navigation';

import ModalForm from '../../Global/components/ModalForm';
import bambooIcon from 'assets/green-square.jpg';

function uuid(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid)}

class BundleEditor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      formFields: [],
      hiddenFormInput: '',
      method: '',
      url: '',
      editModal: false
    }
  }

  componentWillMount() {
    console.log("props", this.props);
    let metafield = []
    let method = 'post'
    let url = this.props.bundle === null ? '/bundle' : `/bundle?id=${this.props.bundle.id}`

    if (this.props.bundle) {
      if (this.props.bundle.metafield.length !== 0) {
        method = 'put'
        url = `/bundle/${this.props.bundle.id}`
      }
    }

    let bundles = this.props.bundles.map((item) => item)

    this.setState({
      bundleToEdit: this.props.bundle === null ? this.props.bundles[0] : this.props.bundle,
      method: method,
      url: url,
      bundles: bundles,
      authenticity_token: this.props.authenticity_token
    })
  }

  render() {
    console.log("render", this);
    console.log('state', this.state);
    /**
    * Filtering out Bundles, Cleanses, and Subscriptions on the backend.
    */
    const productOptions = this.props.products.map(product => {
      return { label: product.title, value: product.title }
    })

    let existingMetafields = []
    if (this.state.formFields.length !== 0 ) {
      existingMetafields = this.state.formFields.map((item, i) => {
        return (
          <div key={item.id} className={`bundle-input ${item.id}`}>
          <Select
            label="Bundle Item"
            value={item.title}
            options={productOptions}
            placeholder="Select"
            onChange={this.valueUpdater(item.id, "title")}
          />
          <div className="quantity">
            <TextField
              label="Quantity"
              value={item.quantity || 1}
              type="number"
              name="quantity"
              onChange={this.valueUpdater(item.id, "quantity")}
            />
          </div>
          <Button destructive outline icon="delete" onClick={ () => this.removeFormField(item.id) }></Button>
          </div>
        )
      })
    } else {
      existingMetafields = (
        <p>No associated products yet.</p>
      )
    }

    let bundlesItems = []
    console.log('bundle items', this.props.bundles);

    bundlesItems = this.state.bundles.map(bundle => {
      if (this.state.bundleToEdit.id === bundle.id) {
        console.log('bundle items', bundle.metafield);
      }
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
          actions: [{ content: 'Edit listing', onAction: () => this.handleEdit(bundle) }],
          persistActions: true,
        }
      )
    })

    let mainContainer = (
        <Card
          sectioned
          title={"Welcome"}
          primaryFooterAction={{content: 'New', onAction: () => { window.open('https://bamboojuices.myshopify.com/admin/products/new', '_blank').focus() } }}
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

      let modalContainer = (
        <Card
          sectioned
          title={this.state.bundleToEdit.title}
          >
        <FormLayout>
          <FormLayout.Group>
            <div className="bundle-form">
              { existingMetafields }
              <div className="bundle-input">
                <Button outline icon="add" onClick={ () => this.addFormField() }>
                  add bundle item
                </Button>
              </div>
            </div>
          </FormLayout.Group>
        </FormLayout>
        </Card>
      )

    return (
      <EmbeddedApp
        apiKey={this.props.apiKey}
        shopOrigin={this.props.shopOrigin}
        forceRedirect={true}
      >
        <Page
          icon={bambooIcon}
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
                    renderItem={(item) => {
                      return <ResourceList.Item key={item.id} {...item} />;
                    }}
                  />
                </Card>
            </Layout.Section>
          </Layout>
          <ModalForm
            open={ this.state.editModal }
            onClose={ () => this.setState({editModal: false}) }
            onSave={ () => this.handleSave() }
            title="Bundle Editor"
          >
            <div>
              <form
                action={this.state.url}
                acceptCharset="UTF-8" method="post"
                ref={(form) => {this.bundleForm = form}}
                style={{'display': 'none'}}
                >
                <input name="utf8" type="hidden" value="✓" />
                <input type="hidden" name="_method" value={this.state.method} />
                <input type="hidden" name="authenticity_token" value={this.state.authenticity_token} />
                <label htmlFor="metafield">Search for:</label>
                <input type="text" name="metafield" id="metafield" value={this.state.hiddenFormInput} onChange={ () => this.formUpdater('hiddenFormInput')} ref={(textInput) => {this.metaInput = textInput}}/>
              </form>
              { modalContainer }
            </div>
          </ModalForm>
        </Page>
      </EmbeddedApp>
    );
  }

  valueUpdater(id, name) {
    return (value) => {
      let metafield = this.state.formFields.map((field, i) => {
        if (field.id !== id) {
          return field
        } else {
          field[name] = value
          return field
        }
        })
        this.setState({formFields: metafield})
      }
  }

  formUpdater(field) {
    console.log('meh', field);
    return (value) => this.setState({[field]: value});
  }

  handleSave() {
    let dataString = this.state.formFields.map(field => {
      return field.title.split('_')[0] + ' x' + field.quantity
    }).join(',')

    this.metaInput.value = dataString
    console.log('data', dataString, this.bundleForm, this.metaInput.value);
    this.bundleForm.submit()
  }

  handleEdit(bundle) {
    let method = 'post'
    let url = `/bundle?id=${bundle.id}`
    let fields = []

    let bundleToEdit = Object.assign({}, bundle)
    if (bundleToEdit.metafield.length !== 0) {
      method = 'put'
      url = `/bundle/${bundle.id}`
      fields = bundleToEdit.metafield.map((item) => item)
    }

    this.setState({
      bundleToEdit: bundleToEdit,
      editModal: true,
      formFields: fields,
      method: method,
      url: url
    })
  }

  addFormField() {
    let formFields = this.state.formFields
    formFields.push({title: this.props.products[0].title, quantity: 1, id: uuid() })

    console.log('formFields add pst', formFields);
    console.log('formFields add pst', this.props.bundles);
    this.setState({
      formFields: formFields,
    })
    console.log('formFields add pst', this.state.formFields);
  }

  removeFormField(id) {
    let formFields = this.state.formFields.filter(item => {
      // Remove item
      return item.id != id
    })

    console.log('formFields remove pre', formFields);
    this.setState({
      formFields: formFields,
    })
    console.log('formFields remove pst', this.state.formFields);
  }

}
export default BundleEditor
