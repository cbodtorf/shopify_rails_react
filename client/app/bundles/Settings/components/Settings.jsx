import React from 'react';
import {Page, Card, Banner, FormLayout, Select, Layout, Button, Icon, ResourceList, TextStyle, TextField, Subheading, Tabs, Link, ChoiceList, DatePicker, Badge} from '@shopify/polaris';
import {EmbeddedApp, Alert, Bar} from '@shopify/polaris/embedded';

class Settings extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      tab: 3,
      deleteAlertOpen: false,
      pickupLocation: {},
      pickupLocations: [],
      blackoutDates: [],
    }
  }

  componentWillMount() {

    this.setState({
      pickupLocations: this.props.pickupLocations
    })
  }

  render() {
    console.log("render", this.state);
    const weekNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    const blackoutDates = this.state.blackoutDates.map(date => {
      return (
        {
          attributeOne: date.date,
          actions: [
            {content: 'Edit date', onAction: () => { this.handleEdit(date) }},
            {content: <Icon source="delete" color="red" />, onAction: () => { this.setState({deleteAlertOpen: true, dateToDelete: date}) }},
          ],
          persistActions: true,
        }
      )
    })

    const pickupLocations = this.state.pickupLocations.map(location => {
      return (
        {
          attributeOne: location.title,
          attributeTwo: <TextStyle variation="subdued">{location.address}</TextStyle>,
          attributeThree: location.days_available.map((day, i) => {return (<Badge key={i} status="info">{weekNames[day]}</Badge>)}),
          actions: [
            {content: 'Edit location', onAction: () => { this.handleEdit(location) }},
            {content: <Icon source="delete" color="red" />, onAction: () => { this.setState({deleteAlertOpen: true, locationToDelete: location}) }},
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
      >
        <Page title={`Settinhgs`}>
          <Layout>
            <Layout.Section>
              <div className="bamboo-nav">
                <Link url="/dashboard">Dashboard</Link>
                <Link url="/rates">Rates</Link>
                <Link url="/bundle">Bundles</Link>
                <Link url="/settings">Settings</Link>
              </div>
              {/* <Tabs
                selected={this.state.tab}
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
                    url: `/bundle`,
                  },
                  {
                    id: 'settings',
                    title: 'Settings',
                    panelID: 'settings',
                    url: '/settings',
                  },
                ]}
              /> */}
            </Layout.Section>

            <Layout.AnnotatedSection
              title="Pickup Locations"
              description="Customers will be able to choose pickup locations from the cart page, this information will be added to the order."
            >
              <Card
                sectioned
                primaryFooterAction={{content: 'Save', onAction: () => { this.handleSave() } }}
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
                      onChange={this.valueUpdater('title')}
                    />
                    <TextField
                      label="Address"
                      name="pickup_location[address]"
                      type="text"
                      value={this.state.pickupLocation.address}
                      onChange={this.valueUpdater('address')}
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
                      onChange={this.valueUpdater('days_available')}
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
            <Layout.AnnotatedSection
              title="Blackout Dates"
              description="Customers will be unable to select these dates for their deliveries."
            >
              <Card sectioned>
                <FormLayout>
                <TextField label="Blackout Date" />
                  <Icon source="calendar" />
                  <DatePicker
                    disableDatesBefore={new Date()}
                    onMonthChange
                    month={5}
                    year={2017}
                  />
                </FormLayout>
                <ResourceList
                  items={blackoutDates}
                  renderItem={(item, index) => {
                    return <ResourceList.Item key={index} {...item} />;
                  }}
                />
              </Card>
            </Layout.AnnotatedSection>
          </Layout>
          <Alert
            title="Delete Pickup Location?"
            open={this.state.deleteAlertOpen}
            confirmContent="Delete"
            onConfirm={() => {
              this.handleDelete(this.state.locationToDelete).bind(this)
              this.setState({deleteAlertOpen: false, locationToDelete: null})
              }}
            cancelContent="Continue editing"
            onCancel={() => this.setState({deleteAlertOpen: false})}
          >
            Are you sure you want to delete this pickup location?
          </Alert>
        </Page>
      </EmbeddedApp>
      </div>
    );
  }
  valueUpdater(field) {
    return (value) => this.setState({ pickupLocation: { ...this.state.pickupLocation, [field]: value } });
  }

  handleSave() {
    this.pickupLocationForm.submit()
  }

  handleDelete(location) {
    let self = this
    $.ajax({
       type: "DELETE",
       url: `/destroy_pickup_location?id=${location.id}`,
       success: function (result) {
       },
       error: function (result){
         console.console.log('meh', result);
         window.alert("something went wrong!");
       }
    });
  }

}
export default Settings
