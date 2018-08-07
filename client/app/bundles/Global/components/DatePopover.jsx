import React from 'react'
import {
  DatePicker,
  Popover,
  Button,
  Stack,
  Select,
  FormLayout
} from '@shopify/polaris';

const options = [
  {label: 'Today', value: 'Today'},
  {label: 'Yesterday', value: 'Yesterday'},
  {label: 'Tomorrow', value: 'Tomorrow'},
  {label: 'Next week', value: 'Next week'},
  {label: 'Last week', value: 'Last week'},
]

class DatePopover extends React.Component {
  state = {
    active: false,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    optionSelected: "Today",
    selected: new Date()
  };

  togglePopover = (evt) => {
    if (evt !== undefined) {
      if (evt.target !== undefined) {
        this.setState(({ active }) => {
          return {active: !active};
        });
      }
    } else {
      this.setState(({ active }) => {
        return {active: !active};
      });
    }
  }

  render() {
    const disableBefore = new Date();
    const disableAfter = new Date();

    const { month, year, selected } = this.state;
    const activator = (
      <Button icon="calendar" onClick={ this.togglePopover }></Button>
    );

    return (
      <div className="datepopover" style={ {minWidth: '506px'} }>
        <Popover
          active={ this.state.active }
          activator={ activator }
          onClose={ (evt) => {
            if (!(evt > 0)) {
              this.togglePopover()
            }
          } }
        >
          <div style={ {minHeight: '406px'} }>
            <Popover.Pane sectioned>
              <Stack vertical>
                <FormLayout>
                  <Select
                    label="Date selector"
                    options={ options }
                    onChange={ this.handleSelectChange }
                    value={ this.state.optionSelected }
                  />
                </FormLayout>
                <Stack.Item>
                  <DatePicker
                    disableDatesAfter={ new Date(disableAfter.setMonth(disableAfter.getMonth() + 2)) }
                    disableDatesBefore={ new Date(disableBefore.setYear(disableBefore.getFullYear() - 1)) }
                    month={ this.state.month }
                    year={ this.state.year }
                    onChange={ this.handleChange }
                    onMonthChange={ this.handleMonthChange }
                    selected={ selected }
                  />
                </Stack.Item>
              </Stack>
            </Popover.Pane>
            <Popover.Pane fixed sectioned>
              <Stack distributionTrailing>
                <Stack.Item fill>
                  <Button onClick={ this.togglePopover }>Cancel</Button>
                </Stack.Item>
                <Stack.Item>
                  <Button primary onClick={ () => { this.togglePopover(); this.props.handleDateChange(this.state.selected); } }>Apply</Button>
                </Stack.Item>
              </Stack>
            </Popover.Pane>
          </div>
        </Popover>
      </div>
    );
  }

  handleSelectChange = (value) => {
    let selected = this.state.selected

    if (options.filter(option => option.value === value).length > 0) {
      let today = new Date()
      let opts = {
        Today() { return today },
        Yesterday() { return today.setDate(today.getDate() - 1) },
        Tomorrow() { return today.setDate(today.getDate() + 1) },
        ["Next week"]() { return today.setDate(today.getDate() + 7) },
        ["Last week"]() { return today.setDate(today.getDate() - 7) },
      }
      selected = new Date(opts[value]())
    }

    this.setState({
      selected: selected,
      optionSelected: value
    });
  }

  handleChange = (value) => {

    this.setState({selected: value.end});
  }

  handleMonthChange = (month, year) => {
    this.setState({
      month,
      year
    })
  }
}

export default DatePopover
