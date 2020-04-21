import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { saveAs } from 'file-saver'
import { isEmpty } from 'lodash'
import isEqual from 'react-fast-compare'
import Icon from 'components/Icon'

import ReactFileReader from 'react-file-reader'
import CodeEditor from 'components/Code/CodeEditor'

import { getValue, getAllYAMLValue } from 'utils/yaml'

import styles from './index.scss'

const objectToYaml = formTemplate => {
  if (formTemplate.metadata) {
    return getValue('yaml', formTemplate)
  }

  return Object.values(formTemplate)
    .map(value => getValue('yaml', value || {}))
    .join('---\n')
}

const yamlToObject = (data, hasMeta) => {
  const values = getAllYAMLValue(data)

  if (hasMeta && values.length === 1) {
    return values[0]
  }

  return values.reduce(
    (prev, cur) => ({
      ...prev,
      [cur.kind || 'Unkown']: cur,
    }),
    {}
  )
}

export default class EditMode extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    mode: PropTypes.string,
    value: PropTypes.object,
    readOnly: PropTypes.bool,
  }

  static defaultProps = {
    mode: 'yaml',
    readOnly: false,
  }

  get options() {
    const { readOnly } = this.props
    return {
      readOnly,
      width: '100%',
      height: '100%',
    }
  }

  constructor(props) {
    super(props)

    this.value = objectToYaml(props.value)
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.value, this.props.value)) {
      this.value = objectToYaml(nextProps.value)
      this.forceUpdate()
    }
  }

  handleUpload = file => {
    const reader = new FileReader()
    reader.onload = e => {
      if (!isEmpty(e.target.result)) {
        this.value = e.target.result
        this.forceUpdate()
      }
    }
    reader.readAsText(file[0])
  }

  handleDownload = () => {
    console.log('object')
    const { mode } = this.props

    const fileName = `default.${mode}`

    this.saveAsFile(this.value, fileName)
  }

  saveAsFile = (text = '', fileName = 'default.txt') => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, fileName)
  }

  handleChange = value => {
    this.value = value
  }

  getData = () => yamlToObject(this.value, !!this.props.value.metadata)

  render() {
    const { mode, className, editorClassName, readOnly } = this.props

    return (
      <div className={classnames(styles.mode, className)}>
        <div className={classnames(styles.edit, editorClassName)}>
          <CodeEditor
            className={styles.editor}
            mode={mode}
            value={this.value}
            options={this.options}
            onChange={this.handleChange}
          />
          <div className={styles.ops} onClick={this.handleModeChange}>
            {!readOnly && (
              <>
                <ReactFileReader
                  fileTypes={['.yaml']}
                  handleFiles={this.handleUpload}
                >
                  <Icon name="upload" style={{ fontSize: 20 }} />
                </ReactFileReader>
                <span className={styles.split}>|</span>
              </>
            )}
            <span onClick={this.handleDownload}>
              <Icon name="download" style={{ fontSize: 20 }} />
            </span>
          </div>
        </div>
      </div>
    )
  }
}
