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

import { Container } from 'ui/embeddable/containers';
import { AnyEmbeddable, Embeddable } from '../embeddables';

import {
  ActionSavedObject,
  ActionSavedObjectAttributes,
} from 'ui/embeddable/actions/action_saved_object';
export interface ExecuteOptions<ActionEmbeddable, ActionContainer> {
  embeddable: ActionEmbeddable;
  container: ActionContainer;
}

export type AnyAction = Action<any, any, any>;

export abstract class Action<
  ContainerState,
  ActionEmbeddable extends Embeddable<ContainerState, any>,
  ActionContainer extends Container<any, any, ContainerState>
> {
  public id?: string;
  public title: string;
  public embeddableType: string = ''; // If empty, shows up for all elements
  public embeddableId: string = ''; // If empty, shows up for all instances
  public readonly type: string;
  public description: string = '';

  public embeddableTemplateMapping: { [key: string]: string } = {};

  constructor({
    actionSavedObject,
    type,
  }: {
    actionSavedObject?: ActionSavedObject;
    type: string;
  }) {
    this.id = actionSavedObject ? actionSavedObject.id : undefined;
    this.title = actionSavedObject ? actionSavedObject.attributes.title : '';
    this.type =
      actionSavedObject && actionSavedObject.attributes.type
        ? actionSavedObject.attributes.type
        : type;
  }

  public abstract isCompatible({
    embeddable,
    container,
  }: {
    embeddable: ActionEmbeddable;
    container: ActionContainer;
  }): Promise<boolean>;

  public abstract execute(executeOptions: ExecuteOptions<ActionEmbeddable, ActionContainer>): void;

  public getSavedObjectAttributes(): ActionSavedObjectAttributes {
    return {
      title: this.title,
      embeddableType: this.embeddableType,
      type: this.type,
      embeddableId: this.embeddableId,
      description: this.description,
      configuration: this.getConfiguration(),
      embeddableTemplateMapping: this.mappingToString(),
    };
  }

  public updateConfiguration(config: string) {
    return;
  }

  public mappingToString() {
    return JSON.stringify(this.embeddableTemplateMapping);
  }

  public mappingFromString(mapping: string) {
    this.embeddableTemplateMapping = JSON.parse(mapping);
  }

  public getConfiguration() {
    return '';
  }

  protected flatten(shape: { [key: string]: any }, prefix = '') {
    let output: { [key: string]: string } = {};
    Object.keys(shape).map(key => {
      const value = shape[key];
      if (Array.isArray(value) || typeof value === 'object') {
        output = {
          ...output,
          ...this.flatten(shape[key], prefix + key + '.'),
        };
      } else {
        output[prefix + key] = value;
      }
    });
    return output;
  }

  protected injectTemplateParameters(template: string, embeddable: AnyEmbeddable) {
    let output = template;
    const mapping = this.embeddableTemplateMapping;
    const embeddableOutput = { ...embeddable.getOutput() };
    delete embeddableOutput.indexPatterns;
    const flattenedOutput = this.flatten(embeddableOutput);
    Object.keys(mapping).forEach(name => {
      const path = mapping[name];
      const replaceValue = `\$\{${name}\}`;
      output = output.replace(replaceValue, flattenedOutput[path]);
    });
    return output;
  }
}
