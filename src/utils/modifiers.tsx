/**
 * Copyright (c) 2018-2023 California Institute of Technology ("Caltech"). U.S.
 * Government sponsorship acknowledged.
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * * Neither the name of Caltech nor its operating division, the Jet Propulsion
 *   Laboratory, nor the names of its contributors may be used to endorse or
 *   promote products derived from this software without specific prior written
 *   permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import { Filter } from "./store";

export const getSearchQuery = (
  text: string,
  suggestField: string,
  completionField: string,
  filterTerms: Record<string, any> = {},
  filterList: string[] = [],
  isDataViz: boolean = false
): any => {
  let query: Record<string, any> = {
    query: {
      bool: {
        must: {
          query_string: {
            query: text.replace(/\//g, "//"),
            type: "best_fields",
          },
        },
      },
    },
  };

  if (isDataViz && text && text.length && (suggestField || completionField)) {
    query["suggest"] = {};
    if (suggestField) {
      query["suggest"]["similarity-suggestion"] = {
        text: text,
        term: {
          field: suggestField,
          suggest_mode: "always",
          sort: "frequency",
          size: 100,
          max_edits: 2,
          min_word_length: 2,
          max_term_freq: 2000000,
        },
      };
    }

    if (completionField) {
      query["suggest"]["completion"] = {
        prefix: text,
        completion: {
          field: `${completionField}.completion`,
          size: 2000,
          skip_duplicates: true,
        },
      };
    }

  } else if (filterTerms && Object.keys(filterTerms).length) {
    query.query = {
      bool: {
        must: { match_all: {} },
      },
    };
  } else if (!text || !text.length) {
    query.query = { match_all: {} };
  }

  if (filterTerms && Object.keys(filterTerms).length) {
    query.query.bool["filter"] = getFilterQuery(filterTerms);
  }

  return query;
};

export const getFilterQuery = (filterTerms: Record<string, any> = {}): any => {
  let filterQueries: Record<string, any>[] = [];

  Object.entries(filterTerms).forEach(([field, fieldValue]) => {
    if (Array.isArray(fieldValue) && fieldValue.length === 1) {
      fieldValue = fieldValue[0];
    }

    if (!Array.isArray(fieldValue)) {
      let term: Record<string, any> = { match: {} };
      term.match[field] = fieldValue;
      filterQueries.push(term);
    } else {
      let filter: Record<string, any> = { bool: { should: [] } };
      fieldValue.forEach((val: string) => {
        let term: Record<string, any> = { match: {} };
        term.match[field] = val;
        filter.bool.should.push(term);
      });
      filterQueries.push(filter);
    }
  });

  return filterQueries;
};

export const getAggQuery = (
  filterTerms: Record<string, any> = {},
  filterList: string[] = [],
  text?: string,
  directQuery?: Record<string, any>
): any => {
  let query: Record<string, any> = {
    aggs: {},
    size: 0,
  };

  if (directQuery && Object.keys(directQuery).length > 0) {
    query["query"] = directQuery;
  } else {
    if ((filterTerms && Object.keys(filterTerms).length) || text) {
      query["query"] = { bool: { must: {} } };
    } else {
      query["query"] = { match_all: {} };
    }

    if (text) {
      query.query.bool.must["query_string"] = {
        query: text.replace(/\//g, "//"),
        type: "best_fields",
      };
    }

    if (filterTerms && Object.keys(filterTerms).length) {
      query.query.bool["filter"] = [];
      if (!text) {
        query.query.bool.must["match_all"] = {};
      }

      Object.entries(filterTerms).forEach(([field, fieldValue]) => {
        if (Array.isArray(fieldValue) && fieldValue.length === 1) {
          fieldValue = fieldValue[0];
        }

        if (!Array.isArray(fieldValue)) {
          let term: Record<string, any> = { match: {} };
          term.match[field] = fieldValue;
          query.query.bool["filter"].push(term);
        } else {
          let filter: Record<string, any> = { bool: { should: [] } };
          fieldValue.forEach((val: string) => {
            let term: Record<string, any> = { match: {} };
            term.match[field] = val;
            filter.bool.should.push(term);
          });
          query.query.bool["filter"].push(filter);
        }
      });
    }
  }

  filterList.forEach((field: string) => {
    query.aggs[field] = {
      terms: { field: field, size: 1000 },
    };
  });
  return query;
};

export const getGroupedFilters = (activeFilters: Filter[]): any => {
  let filters: Record<string, string[]> = {};
  activeFilters.forEach((activeFilter: any) => {
    if (!filters[activeFilter.name]) {
      filters[activeFilter.name] = [];
    }
    filters[activeFilter.name].push(activeFilter.value);
  });

  return filters;
};

const modifiers = {
  getSearchQuery,
  getAggQuery,
  getGroupedFilters,
};

export default modifiers;
