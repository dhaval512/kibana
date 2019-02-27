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

import { EuiBasicTable, EuiFormRow, EuiSelect } from '@elastic/eui';
import React from 'react';
import { embeddableFactories } from 'ui/embeddable';

interface BrowseOutputParametersState {
  factoryName: string;
}

export class BrowseOutputParameters extends React.Component<{}, BrowseOutputParametersState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      factoryName: 'visualization',
    };
  }

  public render() {
    return (
      <div>
        <EuiFormRow label="Element Type">
          <EuiSelect options={this.getFactoryTypeOptions()} onChange={this.selectFactory} />
        </EuiFormRow>
        {this.renderOutputParameters()}
      </div>
    );
  }

  private renderOutputParameters() {
    const factory = embeddableFactories.getFactoryByName(this.state.factoryName);
    const columns = [
      {
        field: 'accessPath',
        sortable: false,
        name: 'Access path',
        render: (path: string) => <pre>{path}</pre>,
      },
      {
        field: 'description',
        sortable: false,
        name: 'Description',
      },
    ];
    const rows = Object.values(factory.getOutputSpec());
    return <EuiBasicTable columns={columns} items={rows} />;
  }

  private selectFactory = (e: any) => {
    this.setState({ factoryName: e.target.value });
  };

  private getFactoryTypeOptions() {
    return Object.values(embeddableFactories.getFactories()).map(factory => ({
      value: factory.name,
      text: factory.name,
    }));
  }
}
