import React from 'react';
import {Page, Card, Banner, FormLayout, Select, Layout, Button, Icon, ResourceList, TextStyle, TextField, Subheading, Tabs, Link, ChoiceList, DatePicker, Badge} from '@shopify/polaris';
import {EmbeddedApp, Alert, Bar} from '@shopify/polaris/embedded';
import Navigation from '../../Global/components/Navigation';
import bambooIcon from 'assets/green-square.jpg';


const weekNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

class PickupLocations extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      deleteAlertPickupOpen: false,
      pickupLocation: {},
      pickupLocations: [],
    }
  }
  /**
  * Helps to format Dates input single d, outputs dd.
  * ie. addZ(2) => '02'
  */
  addZ(n){return n<10? '0'+n:''+n;}

  componentWillMount() {

    this.setState({
      pickupLocations: this.props.pickupLocations,
    })
  }

  render() {
    console.log("render", this.state);

    const pickupLocations = this.state.pickupLocations.map(location => {
      return (
        {
          attributeOne: location.title,
          attributeTwo: <TextStyle variation="subdued">{location.address}</TextStyle>,
          attributeThree: location.days_available.map((day, i) => {return (<Badge key={i} status="info">{weekNames[day]}</Badge>)}),
          actions: [
            {content: 'Edit location', onAction: () => { this.handleEdit(location) }},
            {content: <Icon source="delete" color="red" />, onAction: () => { this.setState({deleteAlertPickupOpen: true, locationToDelete: location}) }},
          ],
          persistActions: true,
        }
      )
    })

    return (
      <div className="bamboo-settings">
      <EmbeddedApp
        apiKey={this.props.apiKey}
        shopOrigin={this.props.shopOrigin}
        forceRedirect={true}
      >
        <Page title={`Pickup Locations`} fullWidth icon={bambooIcon}>
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={null}/>
            </Layout.Section>

            <Layout.AnnotatedSection
              title="Pickup Locations"
              description="Customers will be able to choose pickup locations from the cart page, this information will be added to the order."
            >
              <Card
                sectioned
                primaryFooterAction={{content: 'Save', onAction: () => { this.handleSave(this.pickupLocationForm) } }}
              >
              <form
                action='/create_pickup_location'
                acceptCharset="UTF-8" method="post"
                ref={(form) => {this.pickupLocationForm = form}}
                >
                  <FormLayout>
                    <input name="utf8" type="hidden" value="✓" />
                    <input type="hidden" name="_method" value={this.state.pickupLocationMethod} />
                    <input type="hidden" name="authenticity_token" value={this.props.authenticity_token} />
                    <TextField
                      label="Store name"
                      name="pickup_location[title]"
                      type="text"
                      value={this.state.pickupLocation.title}
                      onChange={this.valueUpdater('title', 'pickupLocation')}
                    />
                    <TextField
                      label="Address"
                      name="pickup_location[address]"
                      type="text"
                      value={this.state.pickupLocation.address}
                      onChange={this.valueUpdater('address', 'pickupLocation')}
                    />
                    <ChoiceList
                      allowMultiple
                      title="Available pickup days"
                      name="pickup_location[days_available]"
                      choices={[
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
                      ]}
                      selected={this.state.pickupLocation.days_available ? this.state.pickupLocation.days_available : []}
                      onChange={this.valueUpdater('days_available', 'pickupLocation')}
                    />
                  </FormLayout>
                </form>
                <ResourceList
                  items={pickupLocations}
                  renderItem={(item, index) => {
                    return <ResourceList.Item key={index} {...item} />;
                  }}
                />
              </Card>
            </Layout.AnnotatedSection>
          </Layout>
          <Alert
            title="Delete Pickup Location?"
            open={this.state.deleteAlertPickupOpen}
            confirmContent="Delete"
            onConfirm={() => {
              this.handleDelete(`/destroy_pickup_location?id=${this.state.locationToDelete.id}`).bind(this)
              this.setState({deleteAlertPickupOpen: false, locationToDelete: null})
              }}
            cancelContent="Continue editing"
            onCancel={() => this.setState({deleteAlertPickupOpen: false})}
          >
            Are you sure you want to delete this pickup location?
          </Alert>
        </Page>
      </EmbeddedApp>
      </div>
    );
  }
  valueUpdater(field, namespace) {
    return (value) => this.setState({ [namespace]: { ...this.state[namespace], [field]: value } });
  }

  handleSave(formType) {
      formType.submit()
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
