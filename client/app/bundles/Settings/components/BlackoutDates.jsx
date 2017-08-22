import React from 'react';
import {Page, Card, Banner, FormLayout, Select, Layout, Button, Icon, ResourceList, TextStyle, TextField, Subheading, Tabs, Link, ChoiceList, DatePicker, Badge} from '@shopify/polaris';
import {EmbeddedApp, Alert, Modal} from '@shopify/polaris/embedded';
import Navigation from '../../Global/components/Navigation';
import bambooIcon from 'assets/green-square.jpg';


const weekNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

class BlackoutDates extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      deleteAlertBlackoutOpen: false,
      blackoutDate: {},
      blackoutDates: [],
      editModal: false
    }
  }
  /**
  * Helps to format Dates input single d, outputs dd.
  * ie. addZ(2) => '02'
  */
  addZ(n){return n<10? '0'+n:''+n;}

  componentWillMount() {

    this.setState({
      blackoutDates: this.props.blackoutDates,
    })
  }

  render() {
    console.log("render", this.state);
    const blackoutDates = this.state.blackoutDates.map(date => {
      let d = new Date(date.blackout_date)
      let utc = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),  d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds())
      return (
        {
          attributeOne: date.title,
          attributeTwo: utc.toLocaleDateString(),
          actions: [
            {content: 'Edit date', onAction: () => { this.handleEdit(date) }},
            {content: <Icon source="delete" color="red" />, onAction: () => { this.setState({deleteAlertBlackoutOpen: true, dateToDelete: date}) }},
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
        <Page title={`Blackout Dates`} fullWidth icon={bambooIcon}>
          <Layout>
            <Layout.Section>
              <Navigation selectedTab={null}/>
            </Layout.Section>
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
          <Modal
            src="/edit_blackout_date"
            open={this.state.editModal}
            title="Edit blackout date"
            primaryAction={{
              content: 'Update account',
              onAction: () => this.setState({editModal: false}),
            }}
            secondaryActions={[{
              content: 'Change account',
              onAction: () => this.setState({editModal: false}),
            }]}
            onClose={() => this.setState({editModal: false})}
          />
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
export default BlackoutDates
