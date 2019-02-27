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
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
} from '@elastic/eui';
import React from 'react';
import {
  actionFactoryRegistry,
  AnyAction,
  AnyEmbeddable,
  getAction,
  saveAction,
} from 'ui/embeddable';
import { ConfigureTemplateParameters } from './configure_template_parameters';

export interface ActionEditorProps {
  clearEditor: () => void;
  actionId: string;
  embeddable?: AnyEmbeddable;
}
interface ActionEditorState {
  action?: AnyAction;
  config: string;
}

export class ActionEditor extends React.Component<ActionEditorProps, ActionEditorState> {
  private editorRoot?: React.RefObject<HTMLDivElement>;
  private setEditorRoot: (element: React.RefObject<HTMLDivElement>) => void;
  constructor(props: ActionEditorProps) {
    super(props);
    this.state = {
      config: '',
    };

    this.setEditorRoot = (element: React.RefObject<HTMLDivElement>) => {
      this.editorRoot = element;

      if (this.state.action && this.editorRoot) {
        const factory = actionFactoryRegistry.getFactoryById(this.state.action.type);
        factory.renderEditor(this.editorRoot, this.state.config, this.onChange);
      }
    };
  }

  public async componentDidMount() {
    const action = await getAction(this.props.actionId);

    this.setState({ action, config: action.getSavedObjectAttributes().configuration });
  }

  public saveAndClose = async () => {
    if (this.state.action) {
      this.state.action.updateConfiguration(this.state.config);
      await saveAction(this.state.action);
      this.cancel();
    }
  };

  public setName = (e: any) => {
    const name = e.target.value;
    this.setState(prevState => {
      const action = prevState.action;
      if (action) {
        action.title = name;
      }
      return {
        action,
      };
    });
  };

  public render() {
    if (!this.state.action) {
      return null;
    }
    return (
      <EuiForm>
        <EuiFormRow label="Name">
          <EuiFieldText onChange={this.setName} value={this.state.action.title} />
        </EuiFormRow>

        <ConfigureTemplateParameters
          onMappingChange={this.onMappingChange}
          embeddableTemplateMapping={this.state.action.embeddableTemplateMapping}
        />
        <EuiFlexGroup>
          <EuiFlexItem>
            <div ref={this.setEditorRoot} />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiButton onClick={this.saveAndClose}>Save</EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton onClick={this.cancel}>Close</EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiForm>
    );
  }

  private onMappingChange = (newMapping: { [key: string]: string }) => {
    this.setState(prevState => {
      const action = prevState.action;
      if (action) {
        action.embeddableTemplateMapping = newMapping;
        return { action };
      }
    });
  };

  private onChange = (config: string) => {
    this.setState(
      {
        config,
      },
      () => {
        if (this.state.action) {
          const factory = actionFactoryRegistry.getFactoryById(this.state.action.type);
          factory.renderEditor(this.editorRoot, this.state.config, this.onChange);
        }
      }
    );
  };

  private cancel = () => {
    this.props.clearEditor();
  };
}
