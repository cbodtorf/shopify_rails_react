import React from 'react';
import {Page, Card, Banner, FormLayout, Select, Layout, Button, Icon, ResourceList, TextStyle, TextField, Subheading, Tabs, Link, ChoiceList, DatePicker, Badge} from '@shopify/polaris';
import {EmbeddedApp, Alert, Bar} from '@shopify/polaris/embedded';

import Navigation from '../../Global/components/Navigation';
import ModalForm from '../../Global/components/ModalForm';
import bambooIcon from 'assets/green-square.jpg';


const weekNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

class PickupLocations extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      method: '',
      formUrl: '',
      deleteAlertPickupOpen: false,
      pickupLocation: {},
      pickupLocations: this.props.pickupLocations,
      editModal: false,
      titleErrors: false,
      addressErrors: false,
      daysAvailableErrors: false,
      descriptionErrors: false
    }
  }
  /**
  * Helps to format Dates input single d, outputs dd.
  * ie. addZ(2) => '02'
  */
  addZ(n){return n<10? '0'+n:''+n;}

  componentWillMount() {
    console.log("this", this);
  }

  render() {
    console.log("render", this.state);

    let daysAvailableErrors = false
    if (this.state.daysAvailableErrors) {
      daysAvailableErrors = (
        <div className="Polaris-Labelled__Error">
          <div className="Polaris-Labelled__ErrorIcon">
            <Icon source="alert" color="red" />
          </div>
          { this.state.daysAvailableErrors }
        </div>
      )
    }

    const pickupLocations = this.state.pickupLocations.map(location => {
      return (
        {
          attributeOne: location.title,
          attributeTwo: <TextStyle variation="subdued">{ location.address }</TextStyle>,
          attributeThree: <TextStyle variation="subdued">{ location.description }</TextStyle>,
          badges: location.days_available.map((day, i) => { return ({ content: weekNames[day], status: "info" }) }),
          actions: [
            { content: 'Edit location', onAction: () => { this.handleEdit(location) } },
            { content: <Icon source="delete" color="red" />, onAction: () => { this.setState({ deleteAlertPickupOpen: true, locationToDelete: location }) } },
          ],
          persistActions: true,
        }
      )
    })

    return (
      <div className="bamboo-settings">
      <EmbeddedApp
        apiKey={ this.props.apiKey }
        shopOrigin={ this.props.shopOrigin }
        forceRedirect={ false }
      >
        <Page icon={ bambooIcon }>
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={ null } shop={this.props.shop_session.url}/>
            </Layout.Section>

            <Layout.AnnotatedSection
              title="Pickup Locations"
              description={
                <div>
                  <div>Customers will be able to choose pickup locations from the cart page, this information will be added to the order.</div>
                  <Button onClick={ () => {
                    this.setState({
                      pickupLocation: {},
                      method: 'post',
                      formUrl: '/create_pickup_location',
                      editModal: true
                    })
                  } }>Create new pickup location</Button>
                </div>
              }
            >
              <Card
                sectioned
              >
                <ResourceList
                  items={ pickupLocations }
                  renderItem={ (item, index) => {
                    return <ResourceList.Item key={ index } { ...item } />;
                  } }
                />
              </Card>
            </Layout.AnnotatedSection>
          </Layout>
          <Alert
            title="Delete Pickup Location?"
            open={ this.state.deleteAlertPickupOpen }
            confirmContent="Delete"
            onConfirm={ () => {
              this.handleDelete(`/destroy_pickup_location?id=${this.state.locationToDelete.id}`).bind(this)
              this.setState({ deleteAlertPickupOpen: false, locationToDelete: null })
              } }
            cancelContent="Continue editing"
            onCancel={ () => this.setState({ deleteAlertPickupOpen: false }) }
          >
            Are you sure you want to delete this pickup location?
          </Alert>
          <ModalForm
            open={ this.state.editModal }
            onClose={ () => this.setState({ editModal: false }) }
            onSave={ () => this.handleSave(this.pickupLocationForm) }
            title="Pickup Location"
          >
            <div className="modal-form-container">
              <form
                action={ this.state.formUrl }
                acceptCharset="UTF-8" method="post"
                ref={ (form) => { this.pickupLocationForm = form } }
                >
                <FormLayout>
                  <input name="utf8" type="hidden" value="✓" />
                  <input type="hidden" name="_method" value={ this.state.method } />
                  <input type="hidden" name="authenticity_token" value={ this.props.form_authenticity_token } />
                  <TextField
                    label="Store name"
                    name="pickup_location[title]"
                    type="text"
                    error={ this.state.titleErrors }
                    value={ this.state.pickupLocation.title }
                    onChange={ this.valueUpdater('title', 'pickupLocation') }
                  />
                  <TextField
                    label="Address"
                    name="pickup_location[address]"
                    type="text"
                    error={ this.state.addressErrors }
                    value={ this.state.pickupLocation.address }
                    onChange={ this.valueUpdater('address', 'pickupLocation') }
                  />
                  <ChoiceList
                    allowMultiple
                    title="Available pickup days"
                    name="pickup_location[days_available]"
                    choices={ [
                      {
                        label: 'Sun',
                        value: 0,
                      },
                      {
                        label: 'Mon',
                        value: 1,
                      },
                      {
                        label: 'Tue',
                        value: 2,
                      },
                      {
                        label: 'Wed',
                        value: 3,
                      },
                      {
                        label: 'Thu',
                        value: 4,
                      },
                      {
                        label: 'Fri',
                        value: 5,
                      },
                      {
                        label: 'Sat',
                        value: 6,
                      },
                    ] }
                    selected={ this.state.pickupLocation.days_available ? this.state.pickupLocation.days_available : [] }
                    onChange={ this.valueUpdater('days_available', 'pickupLocation') }
                  />
                  { daysAvailableErrors }
                  <TextField
                    label="Description (ex. M-F: 8am to 5pm)"
                    name="pickup_location[description]"
                    type="text"
                    multiline
                    error={ this.state.descriptionErrors }
                    value={ this.state.pickupLocation.description }
                    onChange={ this.valueUpdater('description', 'pickupLocation') }
                  />
                </FormLayout>
              </form>
            </div>
          </ModalForm>
        </Page>
      </EmbeddedApp>
      </div>
    );
  }
  valueUpdater(field, namespace) {
    return (value) => this.setState({ [namespace]: { ...this.state[namespace], [field]: value } });
  }

  handleEdit(location) {
    let pickupLocation = { ...location }
    pickupLocation.days_available = pickupLocation.days_available.map(day => { return Number(day) })
    console.log("pickupLocation: ", pickupLocation)

    this.setState({
      pickupLocation,
      title: location.title,
      method: 'patch',
      formUrl: `/update_pickup_location/${location.id}`,
      editModal: true,
      titleErrors: false,
      addressErrors: false,
      daysAvailableErrors: false,
      descriptionErrors: false
    })
  }

  handleSave(formType) {
    let self = this
    let daysAvailableRule = this.state.pickupLocation.days_available === [] || this.state.pickupLocation.days_available === undefined || this.state.pickupLocation.days_available === null
    let addressRule = this.state.pickupLocation.address === "" || this.state.pickupLocation.address === undefined || this.state.pickupLocation.address === null
    let descriptionRule = this.state.pickupLocation.description === "" || this.state.pickupLocation.description === undefined || this.state.pickupLocation.description === null
    let titleRule = this.state.pickupLocation.title === "" || this.state.pickupLocation.title === undefined || this.state.pickupLocation.title === null
    if (daysAvailableRule) {
      self.setState({daysAvailableErrors: "Must select at least one available pickup day."})
    } else {
      self.setState({daysAvailableErrors: false})
    }
    if (addressRule) {
      self.setState({addressErrors: "Must enter in an address."})
    } else {
      self.setState({addressErrors: false})
    }
    if (descriptionRule) {
      self.setState({descriptionErrors: "Description must not be blank"})
    } else {
      self.setState({descriptionErrors: false})
    }
    if (titleRule) {
      self.setState({titleErrors: "Must enter a title for blackout date."})
    } else {
      self.setState({titleErrors: false})
    }

    if(!daysAvailableRule && !addressRule && !descriptionRule && !titleRule){
      formType.submit()
    }
  }

  handleDelete(url) {
    let self = this
    $.ajax({
       type: "DELETE",
       url: url,
       success: function (result) {
       },
       error: function (result){
         console.console.log('meh', result);
         window.alert("something went wrong!");
       }
    });
  }

}
export default PickupLocations
