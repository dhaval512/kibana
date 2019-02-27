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

import React, { Component } from 'react';

import { EuiFlyoutBody, EuiFlyoutHeader, EuiTitle } from '@elastic/eui';
import { TimeRange } from 'ui/visualize';
import { DashboardContainer } from '../../kibana/public/dashboard/embeddables';
import { DashboardEmbeddable } from '../../kibana/public/dashboard/embeddables/dashboard_container';
import { TimePickerPanel } from './time_picker_panel';

interface CustomizeTimeRangeProps {
  container: DashboardContainer;
  embeddable: DashboardEmbeddable;
  onClose: () => void;
  panelId: string;
}

export class CustomizeTimeRangeFlyout extends Component<CustomizeTimeRangeProps, {}> {
  public render() {
    return (
      <React.Fragment>
        <EuiFlyoutHeader>
          <EuiTitle size="s" data-test-subj="customizePanelTitle">
            <h1>{this.props.embeddable.getOutput().title}</h1>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <TimePickerPanel
            onSave={({ timeRange, inherit }: { timeRange: TimeRange; inherit: boolean }) => {
              const panelId = this.props.panelId;
              const newContainerInputState = _.cloneDeep(this.props.container.getOutput());
              if (!inherit && panelId) {
                newContainerInputState.panels[panelId].embeddableConfig.timeRange = timeRange;
              } else if (panelId && inherit) {
                newContainerInputState.panels[panelId].embeddableConfig.timeRange = undefined;
              }
              this.props.container.onInputChanged(newContainerInputState);
              this.props.onClose();
            }}
            inherit={this.getProps().inherit}
            timeRange={this.getProps().timeRange}
          />
        </EuiFlyoutBody>
      </React.Fragment>
    );
  }

  private getProps() {
    const containerState = this.props.container.getOutput();
    const panelId = containerState.view.visibleContextMenuPanelId;
    if (!panelId) {
      throw new Error('should have a panel id!');
    }
    const perPanelTimeRange = containerState.panels[panelId].embeddableConfig.timeRange;

    const timeRange = perPanelTimeRange ? perPanelTimeRange : containerState.view.timeRange;

    return {
      timeRange,
      inherit: !perPanelTimeRange,
    };
  }
}
