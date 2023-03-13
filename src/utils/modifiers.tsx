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

  if (isDataViz && text && text.length) {
    query["suggest"] = {
      "similarity-suggestion": {
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
      },
      completion: {
        prefix: text,
        completion: {
          field: `${completionField}.completion`,
          size: 2000,
          skip_duplicates: true,
        },
      },
    };
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
    query.query.bool["filter"] = [];
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

  return query;
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
