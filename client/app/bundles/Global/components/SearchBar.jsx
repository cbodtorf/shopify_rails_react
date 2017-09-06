import React from 'react'
import {TextField, Button, Icon, ResourceList, Thumbnail, TextStyle, Badge} from '@shopify/polaris';
import PropTypes from 'prop-types'
import createReactClass from 'create-react-class'
import { createFilter } from './util'

const Search = createReactClass({
  propTypes: {
    className: PropTypes.string,
    inputClassName: PropTypes.string,
    onChange: PropTypes.func,
    caseSensitive: PropTypes.bool,
    sortResults: PropTypes.bool,
    fuzzy: PropTypes.bool,
    throttle: PropTypes.number,
    filterKeys: PropTypes.oneOf([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    value: PropTypes.string
  },

  getDefaultProps () {
    return {
      className: '',
      onChange () {},
      caseSensitive: false,
      fuzzy: false,
      throttle: 200
    }
  },

  getInitialState () {
    return {
      searchTerm: this.props.value || ''
    }
  },

  componentWillReceiveProps (nextProps) {
    if (typeof nextProps.value !== 'undefined' && nextProps.value !== this.props.value) {
      const e = {
        target: {
          value: nextProps.value
        }
      }
      this.updateSearch(e)
    }
  },

  render () {
    const {className, onChange, caseSensitive, sortResults, throttle, filterKeys, value, fuzzy, inputClassName, ...inputProps} = this.props // eslint-disable-line no-unused-vars
    inputProps.type = inputProps.type || 'search'
    inputProps.value = this.state.searchTerm
    inputProps.onChange = this.updateSearch
    inputProps.className = inputClassName
    inputProps.placeholder = inputProps.placeholder || 'Search'
    return (
      <div className={className}>
        <TextField
          prefix={ <Icon source="search" color="inkLightest" /> }
          value={ this.state.searchTerm }
          onChange={ this.updateSearch }
          placeholder={ inputProps.placeholder || 'Search orders' }
         />
      </div>
    )
  },

  updateSearch (e) {
    console.log('updateSearch SearchBar: ', e)
    const searchTerm = e

    this.setState({
      searchTerm: searchTerm
    }, () => {
      if (this._throttleTimeout) {
        clearTimeout(this._throttleTimeout)
      }

      this._throttleTimeout = setTimeout(
        () => this.props.onChange(searchTerm),
        this.props.throttle
      )
    })
  },

  filter (keys) {
    const {filterKeys, caseSensitive, fuzzy, sortResults} = this.props
    return createFilter(
      this.state.searchTerm,
      keys || filterKeys,
      {caseSensitive, fuzzy, sortResults}
    )
  }
})

export default Search
export { createFilter }
