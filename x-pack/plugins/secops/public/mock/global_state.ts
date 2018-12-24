/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { defaultWidth } from '../components/timeline/body';
import { State } from '../store';
import { DEFAULT_PAGE_COUNT } from '../store/local/timeline/model';

export const mockGlobalState: State = {
  local: {
    app: {
      notesById: {},
      theme: 'dark',
    },
    hosts: {
      query: {
        hosts: {
          limit: 2,
        },
        uncommonProcesses: {
          limit: 0,
          upperLimit: 0,
        },
      },
    },
    inputs: {
      global: {
        timerange: {
          kind: 'absolute',
          from: 0,
          to: 1,
        },
        query: [],
        policy: {
          kind: 'manual',
          duration: 5000,
        },
      },
    },
    dragAndDrop: {
      dataProviders: {},
    },
    timeline: {
      timelineById: {
        test: {
          activePage: 0,
          id: 'test',
          itemsPerPage: 5,
          dataProviders: [],
          description: '',
          eventIdToNoteIds: {},
          historyIds: [],
          isFavorite: false,
          isLive: false,
          kqlMode: 'filter',
          kqlQuery: '',
          title: '',
          noteIds: [],
          range: '1 Day',
          show: false,
          pageCount: DEFAULT_PAGE_COUNT,
          pinnedEventIds: {},
          itemsPerPageOptions: [5, 10, 20],
          sort: {
            columnId: 'timestamp',
            sortDirection: 'descending',
          },
          width: defaultWidth,
        },
      },
    },
  },
};