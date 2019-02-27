/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
} from '@elastic/eui';
import React, { Component } from 'react';
import { BrowseOutputParameters } from './browse_output_parameters';

interface Props {
  embeddableTemplateMapping: { [templateName: string]: string };
  onMappingChange: (mapping: { [templateName: string]: string }) => void;
}

interface State {
  embeddableTemplateMapping: { [templateName: string]: string };
  embeddableTemplateName: string;
  embeddableTemplatePath: string;
}

export class ConfigureTemplateParameters extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      embeddableTemplateMapping: this.props.embeddableTemplateMapping,
      embeddableTemplateName: '',
      embeddableTemplatePath: '',
    };
  }

  public render() {
    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiForm>
            <EuiFlexGroup>
              <EuiFlexItem>
                <h2>Element template parameters</h2>
                <EuiSpacer size="s" />
                {this.renderExistingParameterRows(this.state.embeddableTemplateMapping)}
                {this.renderNewParameterRow()}
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiForm>
        </EuiFlexItem>
        <EuiFlexItem>
          <BrowseOutputParameters />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  private postConfigChange = () => {
    this.props.onMappingChange(this.state.embeddableTemplateMapping);
  };

  private renderNewParameterRow() {
    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFormRow label="Template Name">
            <EuiFieldText
              name="Template name"
              onChange={this.setNewEmbeddableTemplateName}
              value={this.state.embeddableTemplateName}
            />
          </EuiFormRow>
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiFormRow label="Path">
            <EuiFieldText
              name="Access path"
              onChange={this.setNewEmbeddableTemplatePath}
              value={this.state.embeddableTemplatePath}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFormRow hasEmptyLabelSpace>
            <EuiButtonIcon iconType="listAdd" onClick={this.addEmbeddableMapping} />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  private renderExistingParameterRows(mapping: { [key: string]: string }) {
    return Object.keys(mapping).map(key => {
      return (
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFormRow label="Name">
              <EuiFieldText
                name="Template name"
                value={key}
                onChange={e => this.updateEmbeddableTemplateName(key, e.target.value)}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow label="Access path">
              <EuiFieldText
                name="Access path"
                value={mapping[key]}
                onChange={e => this.setEmbeddableTemplatePath(key, e.target.value)}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFormRow hasEmptyLabelSpace>
              <EuiButtonIcon iconType="trash" onClick={() => this.deleteMapping(key, mapping)} />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    });
  }

  private deleteMapping = (name: string, mapping: { [key: string]: string }) => {
    delete mapping[name];
    this.setState({ embeddableTemplateMapping: mapping }, this.postConfigChange);
  };

  private addEmbeddableMapping = () => {
    this.setState(
      prevState => ({
        embeddableTemplateMapping: {
          ...prevState.embeddableTemplateMapping,
          [prevState.embeddableTemplateName]: prevState.embeddableTemplatePath,
        },
      }),
      this.postConfigChange
    );
  };

  private setEmbeddableTemplatePath = (key: string, value: string) => {
    this.setState(prevState => {
      const mapping = prevState.embeddableTemplateMapping;
      mapping[key] = value;
      return { embeddableMapping: mapping };
    }, this.postConfigChange);
  };

  private updateEmbeddableTemplateName = (oldName: string, newName: string) => {
    this.setState(prevState => {
      const mapping = prevState.embeddableTemplateMapping;
      const value = mapping[oldName];
      mapping[newName] = value;
      delete mapping[oldName];
      return { embeddableMapping: mapping };
    }, this.postConfigChange);
  };

  private setNewEmbeddableTemplateName = (e: any) => {
    this.setState({ embeddableTemplateName: e.target.value });
  };

  private setNewEmbeddableTemplatePath = (e: any) => {
    this.setState({ embeddableTemplatePath: e.target.value });
  };
}
