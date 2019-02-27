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

import { EuiBasicTable, EuiButton, EuiFormRow, EuiSelect } from '@elastic/eui';
import { EuiSpacer } from '@elastic/eui';
import React from 'react';
import { AnyAction } from 'react-redux/node_modules/redux';
import chrome from 'ui/chrome';
import {
  AnyEmbeddable,
  getActions,
  getTriggers,
  SHOW_EDIT_MODE_TRIGGER,
  Trigger,
} from 'ui/embeddable';

export interface EventEditorProps {
  embeddable?: AnyEmbeddable;
}

interface EventEditorState {
  triggerMapping: { [key: string]: string[] };
  selectedTrigger: string;
}

export class EventEditor extends React.Component<EventEditorProps, EventEditorState> {
  private actions: AnyAction[] = [];
  private triggers: Trigger[] = [];

  constructor(props: {}) {
    super(props);
    this.state = {
      triggerMapping: {},
      selectedTrigger: '',
    };
  }

  public render() {
    return (
      <div>
        {this.renderTriggerSelect()}
        <h3> Actions attached </h3>
        {this.renderExistingActions()}
        <EuiSpacer size="l" />
        <h3> Available actions </h3>
        {this.renderAvailableActions()}
        <EuiButton onClick={this.save}>Save</EuiButton>
      </div>
    );
  }

  public async componentDidMount() {
    await this.findActions();
    this.triggers = await getTriggers();
    const triggerMapping: { [key: string]: string[] } = {};
    let selectedId = '';
    this.triggers.forEach(trigger => {
      if (!triggerMapping[trigger.id]) {
        triggerMapping[trigger.id] = [];
      }

      selectedId = trigger.id;
      const actions = trigger.getActions();
      actions.forEach(action => {
        triggerMapping[trigger.id].push(action.id);
      });
    });

    this.setState({ triggerMapping, selectedTrigger: selectedId });
  }

  private findActions = async () => {
    const allActions = await getActions();

    this.actions = allActions.filter(action => {
      let remove = false;
      if (this.props.embeddable) {
        if (action.embeddableId !== '') {
          remove = action.embeddableId !== this.props.embeddable.id;
        } else if (action.embeddableType !== '') {
          remove = action.embeddableType !== this.props.embeddable.type;
        } else {
          remove = false;
        }
      }
      return !remove;
    });
  };

  private save = async () => {
    Object.keys(this.state.triggerMapping).forEach(triggerId => {
      const actions = this.state.triggerMapping[triggerId];
      chrome.getSavedObjectsClient().update('ui_trigger', triggerId, {
        actions: actions.join(';'),
      });
    });

    this.triggers = await getTriggers();
  };

  private removeTriggerMapping = (actionId: string) => {
    this.setState(prevState => {
      const triggerMapping = { ...prevState.triggerMapping };
      triggerMapping[this.state.selectedTrigger] = triggerMapping[
        this.state.selectedTrigger
      ].filter(id => id !== actionId);
      return {
        triggerMapping,
      };
    });
  };

  private addTriggerMapping = (actionId: string) => {
    this.setState(prevState => {
      const triggerMapping = { ...prevState.triggerMapping };
      triggerMapping[this.state.selectedTrigger].push(actionId);
      return {
        triggerMapping,
      };
    });
  };

  private renderExistingActions() {
    if (!this.state.selectedTrigger) {
      return null;
    }
    const actions = this.state.triggerMapping[this.state.selectedTrigger];
    const items = actions.map((actionId: string) => {
      return this.actions.find(action => action.id === actionId);
    });

    const columns = [
      {
        field: 'title',
        sortable: false,
        name: 'Name',
      },
      {
        field: 'description',
        sortable: false,
        name: 'Description',
      },

      {
        field: 'id',
        sortable: false,
        name: 'Attach',
        render: (id: string) => (
          <EuiButton onClick={() => this.removeTriggerMapping(id)}>Delete</EuiButton>
        ),
      },
    ];
    return <EuiBasicTable columns={columns} items={items} sorting={{}} />;
  }

  private renderAvailableActions() {
    const foundTrigger = this.triggers.find(trigger => trigger.id === this.state.selectedTrigger);
    if (!foundTrigger) {
      return null;
    }

    const columns = [
      {
        field: 'title',
        sortable: false,
        name: 'Name',
      },
      {
        field: 'description',
        sortable: false,
        name: 'Description',
      },

      {
        field: 'id',
        sortable: false,
        name: 'Attach',
        render: (id: string) => (
          <EuiButton onClick={() => this.addTriggerMapping(id)}>Attach</EuiButton>
        ),
      },
    ];
    const items = this.actions.filter(
      action => !this.state.triggerMapping[this.state.selectedTrigger].find(id => id === action.id)
    );
    return <EuiBasicTable columns={columns} items={items} sorting={{}} />;
  }

  private getTriggerOptions() {
    return this.triggers.map(trigger => {
      return {
        value: trigger.id,
        text: trigger.title,
      };
    });
  }

  private changeTrigger = (evt: any) => {
    this.setState({ selectedTrigger: evt.target.value });
  };

  private renderTriggerSelect() {
    return (
      <EuiFormRow label="Trigger">
        <EuiSelect
          options={this.getTriggerOptions()}
          value={this.state.selectedTrigger}
          onChange={this.changeTrigger}
        />
      </EuiFormRow>
    );
  }
}
