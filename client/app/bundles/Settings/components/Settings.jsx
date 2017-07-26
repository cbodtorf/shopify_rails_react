import React from 'react';
import {Page, Card, Banner, FormLayout, Select, Layout, Button, Icon, ResourceList, TextStyle, TextField, Subheading, Tabs, Link, ChoiceList, DatePicker, Badge} from '@shopify/polaris';
import {EmbeddedApp, Alert, Bar} from '@shopify/polaris/embedded';


const weekNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

class Settings extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      tab: 3,
      deleteAlertPickupOpen: false,
      deleteAlertBlackoutOpen: false,
      pickupLocation: {},
      pickupLocations: [],
      blackoutDate: {},
      blackoutDates: [],
    }
  }
  /**
  * Helps to format Dates input single d, ouputs dd.
  * ie. addZ(2) => '02'
  */
  addZ(n){return n<10? '0'+n:''+n;}

  componentWillMount() {

    this.setState({
      pickupLocations: this.props.pickupLocations,
      blackoutDates: this.props.blackoutDates,
    })
  }

  render() {
    console.log("render", this.state);
    const blackoutDates = this.state.blackoutDates.map(date => {
      return (
        {
          attributeOne: date.title,
          attributeTwo: new Date(date.blackout_date).toLocaleDateString(),
          actions: [
            {content: 'Edit date', onAction: () => { this.handleEdit(date) }},
            {content: <Icon source="delete" color="red" />, onAction: () => { this.setState({deleteAlertBlackoutOpen: true, dateToDelete: date}) }},
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
            <Layout.AnnotatedSection
              title="Blackout Dates"
              description="Customers will be unable to select these dates for their deliveries."
            >
              <Card
                sectioned
                primaryFooterAction={{content: 'Save', onAction: () => { this.handleSave(this.blackoutDateForm) } }}
                >
                <form
                  action='/create_blackout_date'
                  acceptCharset="UTF-8" method="post"
                  ref={(form) => {this.blackoutDateForm = form}}
                  >
                  <FormLayout>
                    <input name="utf8" type="hidden" value="✓" />
                    <input type="hidden" name="_method" value={this.state.blackoutDateMethod} />
                    <input type="hidden" name="authenticity_token" value={this.props.authenticity_token} />
                    <TextField
                      label="Blackout Date Title"
                      name="blackout_date[title]"
                      type="text"
                      value={this.state.blackoutDate.title}
                      onChange={this.valueUpdater('title', 'blackoutDate')}
                    />
                    <TextField
                    label="Blackout Date"
                    name="blackout_date[blackout_date]"
                    value={`${this.state.blackoutDate.year}-${this.state.blackoutDate.month}-${this.state.blackoutDate.day}`}
                    onChange={this.blackoutDateUpdater()}
                    type="date"
                    />
                    <Icon source="calendar" />
                  </FormLayout>
                </form>
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
            open={this.state.deleteAlertPickupOpen}
            confirmContent="Delete"
            onConfirm={() => {
              this.handleDelete(`/destroy_pickup_location?id=this.state.locationToDelete.id`).bind(this)
              this.setState({deleteAlertPickupOpen: false, locationToDelete: null})
              }}
            cancelContent="Continue editing"
            onCancel={() => this.setState({deleteAlertPickupOpen: false})}
          >
            Are you sure you want to delete this pickup location?
          </Alert>
          <Alert
            title="Delete Blackout Date?"
            open={this.state.deleteAlertBlackoutOpen}
            confirmContent="Delete"
            onConfirm={() => {
              this.handleDelete(`/destroy_blackout_date?id=${this.state.dateToDelete.id}`).bind(this)
              this.setState({deleteAlertBlackoutOpen: false, dateToDelete: null})
              }}
            cancelContent="Continue editing"
            onCancel={() => this.setState({deleteAlertBlackoutOpen: false})}
          >
            Are you sure you want to delete this blackout date?
          </Alert>
        </Page>
      </EmbeddedApp>
      </div>
    );
  }
  valueUpdater(field, namespace) {
    return (value) => this.setState({ [namespace]: { ...this.state[namespace], [field]: value } });
  }
  blackoutDateUpdater() {
    return (
      (value) => {
        let d = new Date(value.replace('-','/'))
        this.setState({
            blackoutDate: {
              blackout_date: d,
              title: this.state.blackoutDate.title,
              wday: weekNames[d.getDay()],
              day: this.addZ(d.getDate()),
              month: this.addZ(d.getMonth() + 1),
              year: d.getFullYear()
            }
        })
      }
    )
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
export default Settings
