import React from 'react';
import {Page, Card, Banner, FormLayout, Select, TextField, Layout, Button, Icon, ResourceList, Thumbnail, TextStyle, Tabs, Stack} from '@shopify/polaris';
import {EmbeddedApp, Modal} from '@shopify/polaris/embedded';
import Navigation from '../../Global/components/Navigation';

import ModalForm from '../../Global/components/ModalForm';
import SearchBar, {createFilter} from '../../Global/components/SearchBar';

import bambooIcon from 'assets/green-square.jpg';

const KEYS_TO_FILTERS = ['title','product_type']

function uuid(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid)}

const rxOne = /^[\],:{}\s]*$/;
const rxTwo = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
const rxThree = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
const rxFour = /(?:^|:|,)(?:\s*\[)+/g;
const isJSON = (input) => (
  input.length && rxOne.test(
    input.replace(rxTwo, '@')
      .replace(rxThree, ']')
      .replace(rxFour, '')
  )
);

class MetafieldEditor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      healthBenefitsFormFields: [],
      ingredientsFormFields: [],
      hiddenHealthBenefitsFormInput: '',
      hiddenIngredientsFormInput: '',
      method: '',
      url: '',
      formTab: 0,
      searchTerm: '',
      editModal: false
    }
  }

  componentWillMount() {
    console.log("props", this.props);
    let metafield = []
    let method = 'post'
    // let url = this.props.product === null ? '/metafield' : `/metafield?id=${this.props.product.id}`
    //
    // if (this.props.product) {
    //   if (this.props.product.metafield.length !== 0) {
    //     method = 'put'
    //     url = `/metafield/${this.props.product.id}`
    //   }
    // }

    const { form_authenticity_token } = this.props

    this.setState({
      method,
      form_authenticity_token
    })
  }

  render() {
    console.log("render", this);
    console.log('state', this.state);

    let products = []
    console.log('products', this.props.products);

    products = this.props.products.filter(
      createFilter(this.state.searchTerm, KEYS_TO_FILTERS)
    ).map(product => {

      return (
        {
          url: `https://${this.props.shop_session.url}/admin/products/${product.id}`,
          media: <Thumbnail
            source={ product.image ? product.image.src : '' }
            alt={ product.image ? product.image.alt : '' }
            size="small"
          />,
          attributeOne: product.title,
          actions: [{ content: 'Edit listing', onAction: () => this.handleEdit({...product}) }],
          persistActions: true,
        }
      )
    })

    let healthBenefits = []
    let ingredients = []

    // HEALTH BENEFITS
    if (this.state.healthBenefitsFormFields.length !== 0 ) {
      healthBenefits = this.state.healthBenefitsFormFields.map((item, i) => {
        return (
          <div key={ item.id } className={ `bundle-input ${item.id}` }>
            <Stack
              spacing="loose"
              alignment="center"
            >
              <Stack.Item fill>
                <div className="product_details">
                  <TextField
                    placeholder="enter health benefit..."
                    value={ item.title }
                    type="text"
                    name="health_benefit"
                    onChange={ this.valueUpdater(item.id, "title", "healthBenefitsFormFields") }
                  />
                </div>
              </Stack.Item>
              <Button destructive plain icon="delete" onClick={ () => this.removeFormField(item.id, "healthBenefitsFormFields") }></Button>
            </Stack>
          </div>
        )
      })
    } else {
      healthBenefits = (
        <p>No associated health benefits yet.</p>
      )
    }
    // INGREDIENTS
    if (this.state.ingredientsFormFields.length !== 0 ) {
      ingredients = this.state.ingredientsFormFields.map((item, i) => {
        return (
          <div key={ item.id } className={ `bundle-input ${item.id}` }>
            <Stack
              spacing="loose"
              alignment="center"
            >
              <Stack.Item fill>
                <div className="product_details">
                  <TextField
                    placeholder="enter ingredient..."
                    value={ item.title }
                    type="text"
                    name="ingredient"
                    onChange={ this.valueUpdater(item.id, "title", "ingredientsFormFields") }
                  />
                </div>
              </Stack.Item>
              <Button destructive plain icon="delete" onClick={ () => this.removeFormField(item.id, "ingredientsFormFields") }></Button>
            </Stack>
          </div>
        )
      })
    } else {
      ingredients = (
        <p>No associated ingredients yet.</p>
      )
    }

    let mainContainer = (
        <div>
          <div>
            This editor is for adding meta data to Shopify product.
            <br />
            <br />
            Specifically we are detailing health benefits and ingredients
            <br />
            <br />
            <Button
              onClick={ () => { window.open(`https://${this.props.shop_session.url}/admin/products/new`, '_blank').focus() } }
            >
              New Product
            </Button>
          </div>
        </div>
      )

      let modalContainer = (
        <Card.Section
          sectioned
          >
        <FormLayout>
          <FormLayout.Group>
            <div className="bundle-form">
              { this.state.formTab === 0 ? healthBenefits : ingredients }
              <div className="bundle-input">
                <Button outline icon="add" onClick={ () => this.addFormField( this.state.formTab === 0 ? "healthBenefitsFormFields" : "ingredientsFormFields" ) }>
                  add { this.state.formTab === 0 ? "health benefit" : "ingredient" }
                </Button>
              </div>
            </div>
          </FormLayout.Group>
        </FormLayout>
        </Card.Section>
      )

    return (
      <div className="bamboo-settings">
      <EmbeddedApp
        apiKey={ this.props.apiKey }
        shopOrigin={ this.props.shopOrigin }
        forceRedirect={ true }
      >
        <Page
          icon={ bambooIcon }
          >
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={ null } shop={ this.props.shop_session.url }/>
            </Layout.Section>
            <Layout.AnnotatedSection
              description={ mainContainer }
              title={ "Product Health Benefits and Ingredients" }
            >
              <Card>
                <Card.Section>
                  <SearchBar placeholder={ "Search by Title or Product Type" } className="search-input" onChange={ this.searchUpdated.bind(this) } />
                </Card.Section>
                <ResourceList
                  items={ products }
                  renderItem={ (item) => {
                    return <ResourceList.Item key={ item.id } { ...item } />;
                  } }
                />
              </Card>
            </Layout.AnnotatedSection>
          </Layout>
          <ModalForm
            open={ this.state.editModal }
            onClose={ () => this.setState({ editModal: false }) }
            onSave={ () => this.handleSave(this.metaForm) }
            title={ `Edit ${this.state.productToEdit ? "- " + this.state.productToEdit.title : "" }` }
          >
            <div className="modal-form-container">
              <form
                action={ this.state.url }
                acceptCharset="UTF-8" method="post"
                ref={ (form) => { this.metaForm = form } }
                style={ { 'display': 'none' } }
              >
                <input name="utf8" type="hidden" value="✓" />
                <input type="hidden" name="_method" value={this.state.method} />
                <input type="hidden" name="authenticity_token" value={ this.state.form_authenticity_token } />
                <label htmlFor="metafield">Search for:</label>
                <input type="text" name="metafield[health_benefits]" id="metafield_1" value={ this.state.hiddenHealthBenefitsFormInput } onChange={ () => this.formUpdater('hiddenHealthBenefitsFormInput') } ref={ (textInput) => { this.healthBenefitsInput = textInput } }/>
                <input type="text" name="metafield[ingredients]" id="metafield_2" value={ this.state.hiddenIngredientsFormInput } onChange={ () => this.formUpdater('hiddenIngredientsFormInput') } ref={ (textInput) => { this.ingredientsInput = textInput } }/>
              </form>
              <Tabs
                selected={ this.state.formTab }
                fitted={ false }
                onSelect={ (idx) => this.setState({ formTab: idx }) }
                tabs={ [
                  {
                    id: 'health_benefits',
                    title: 'Health Benefits',
                    accessibilityLabel: 'Health Benefits',
                    panelID: 'health_benefits',
                  },
                  {
                    id: 'ingredients',
                    title: 'Ingredients',
                    accessibilityLabel: 'Ingredients',
                    panelID: 'ingredients',
                  },
                ] }
              />
              { modalContainer }
            </div>
          </ModalForm>
        </Page>
      </EmbeddedApp>
      </div>
    );
  }

  valueUpdater(id, name, formFields) {
    return (value) => {
      let metafield = this.state[formFields].map((field, i) => {
        if (field.id !== id) {
          return field
        } else {
          field[name] = value
          return field
        }
        })
        this.setState({[formFields]: metafield})
      }
  }

  formUpdater(field) {
    console.log('meh', field);
    return (value) => this.setState({[field]: value});
  }

  handleSave(formType) {
    let benefitsString = this.state.healthBenefitsFormFields.map(field => {
      return field.title
    }).join(',')
    let ingredientsString = this.state.ingredientsFormFields.map(field => {
      return field.title
    }).join(',')

    this.healthBenefitsInput.value = benefitsString
    this.ingredientsInput.value = ingredientsString
    console.log('data', benefitsString, ingredientsString, formType, this.healthBenefitsInput.value, this.ingredientsInput.value);
    formType.submit()
  }

  _parseJSON(response) {
      console.log("parse data", response)

    return response.text().then(function(text) {
      return isJSON(text) ? JSON.parse(text) : {}
    })
  }

  handleEdit(product) {
    const self = this
    let method = 'post'
    let url = `/metafield?id=${product.id}`
    let fields = []

    if (product.metafield.length !== 0) {
      method = 'put'
      url = `/metafield/${product.id}`
      fields = product.metafield.map((item) => item)
    }

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let fetchSettings = { method: 'GET',
               headers: myHeaders,
               credentials: 'same-origin',
               mode: 'no-cors',
               cache: 'default' };

    fetch(`/product_metafield/${product.id}`, fetchSettings)
    .then(self._parseJSON) // Transform the data into json
    .then(function(data) {
        // Your code for handling the data you get from the API
        console.log("success", data)
        self.setState({
          editModal: true,
          productToEdit: data.product,
          healthBenefitsFormFields: data.product.metafield.health_benefits || [],
          ingredientsFormFields: data.product.metafield.ingredients || [],
          method: method,
          url: url
        })
    })
    .catch(function(error) {
        // This is where you run code if the server returns any errors
        console.error('Hmm something went wrong:', error)
    });
  }

  addFormField(fields) {
    let formFields = [...this.state[fields]]
    formFields.push({title: "", id: uuid() })

    this.setState({
      [fields]: formFields,
    })
  }

  removeFormField(id, fields) {
    let formFields = this.state[fields].filter(item => {
      // Remove item
      return item.id != id
    })

    console.log('formFields remove pre', formFields);
    this.setState({
      [fields]: formFields,
    })
    console.log('state[fields] remove pst', this.state[fields]);
  }

  searchUpdated (term) {
    this.setState({ searchTerm: term })
  }

}
export default MetafieldEditor
