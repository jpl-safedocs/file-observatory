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

import create from "zustand";
import axios, { AxiosInstance } from "axios";
import https from "https";

import { configurePersist } from "zustand-persist";

import { getAggQuery, getGroupedFilters, getSearchQuery } from "./modifiers";

const package_json = require("../../package.json");
const path = window.require("path");

const { persist } = configurePersist({
  storage: localStorage,
  rootKey: "safedocs",
});

export type Filter = {
  name: string;
  value: string;
};

export type DownloadMode = "api" | "local" | "s3";

export type Store = {
  esURL: string;
  setEsURL: (esURL: string) => void;
  kibanaURL: string;
  setKibanaURL: (kibanaURL: string) => void;
  esUsername: string;
  setEsUsername: (esUsername: string) => void;
  esPassword: string;
  setEsPassword: (esPassword: string) => void;
  esAPI: string;
  setEsAPI: (API: string) => void;
  useEsAPI: boolean;
  setUseEsAPI: (useEsAPI: boolean) => void;
  getSearchURL: () => string;
  downloadPathField: string;
  setDownloadPathField: (path: string) => void;
  downloadAPI: string;
  setDownloadAPI: (API: string) => void;
  rawFileLocation: string;
  setRawFileLocation: (location: string) => void;
  downloadMode: DownloadMode;
  setDownloadMode: (downloadMode: DownloadMode) => void;
  s3BucketName: string;
  setS3BucketName: (s3BucketName: string) => void;
  awsProfileName: string;
  setAWSProfileName: (awsProfileName: string) => void;
  index: string;
  validIndex: boolean;
  loadingIndex: boolean;
  loadingIndexMapping: boolean;
  fetchAxios: (timed?: boolean) => typeof axios | AxiosInstance;
  setIndex: (index: string) => void;
  activePage: number;
  setActivePage: (page: number) => void;
  activeFilters: Filter[];
  setActiveFilters: (activeFilters: Filter[]) => void;
  activeField: string;
  setActiveField: (activeField: string) => void;
  activeYField: string;
  setActiveYField: (activeYField: string) => void;
  activeColorField: string;
  setActiveColorField: (activeColorField: string) => void;
  activeSampleSize: number;
  setActiveSampleSize: (activeSampleSize: number) => void;
  activeViz: string;
  setActiveViz: (activeViz: string) => void;
  sigTermsField: string;
  setSigTermsField: (sigTermsField: string) => void;
  recentHexEditorFiles: string[];
  setRecentHexEditorFiles: (recentHexEditorFiles: string[]) => void;
  hexEditorFileDirectory: string;
  setHexEditorFileDirectory: (hexEditorFileDirectory: string) => void;
  loadingDocuments: boolean;
  documentError: boolean;
  setLoadingDocuments: (loading: boolean) => void;
  columnOrder: string[];
  setColumnOrder: (columnOrder: string[]) => void;
  nonVisibleFields: string[];
  setNonVisibleFields: (nonVisibleFields: string[]) => void;
  hiddenVizFields: string[];
  setHiddenVizFields: (hiddenVizFields: string[]) => void;
  nonFilterableFields: string[];
  setNonFilterableFields: (nonFilterableFields: string[]) => void;
  totalDocumentCount: number;
  setTotalDocumentCount: (totalDocumentCount: number) => void;
  virtualPageSize: number;
  setVirtualPageSize: (virtualPageSize: number) => void;
  requestedSkip: number;
  setRequestedSkip: (requestedSkip: number) => void;
  requestedTake: number;
  setRequestedTake: (requestedTake: number) => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  findTerm: string;
  setFindTerm: (findTerm: string) => void;
  advancedSearchOpen: boolean;
  setAdvancedSearchOpen: (advancedSearchOpen: boolean) => void;
  query: Record<string, any>;
  setQuery: (query: Record<string, any>) => void;
  suggestionField: string;
  setSuggestionField: (suggestionField: string) => void;
  geoSpatialField: string;
  setGeoSpatialField: (geoSpatialField: string) => void;
  geoLocations: Record<string, any>[];
  fetchGeoLocations: (topLeft?: number[], bottomRight?: number[], zoom?: number) => void;
  suggestions: any;
  completionField: string;
  setCompletionField: (completionField: string) => void;
  completionFields: string[];
  completions: any[];
  aggregations: any;
  documents: any[];
  plotData: any[];
  fetchPlotData: (fields: string[]) => void;
  sort: any[];
  setSort: (sort: any[]) => void;
  requestFetchDocuments: (requestedSkip?: number, take?: number) => Promise<void>;
  fetchDocuments: (sortOrder?: Record<string, string>[]) => void;
  selectedDocuments: any[];
  setSelectedDocuments: (documents: any[]) => void;
  filterList: string[];
  allMappingFields: string[];
  indexMapping: Record<string, any>;
  fetchIndexMapping: () => void;
  sigTerms: any;
  fetchSigTerms: () => void;
  fetchFilterAggregations: (fields: string[], queryOverride?: Record<string, any>) => void;
  fetchSingleFilterAggregation: (field: string, searchTerm: string) => Promise<string[]>;
  getDocumentsDownloadPaths: (docIDs: number[]) => string | string[];
  getRandomDocumentsDownloadPaths: (count: number) => Promise<string[]>;
  downloadPath: string;
  setDownloadPath: (downloadPath: string) => void;
  fullConfig: Record<string, any>;
  exportConfig: () => any;
  switchIndexConfig: (newIndex: string) => void;
  importConfig: (config: any) => void;
  reset: () => void;
  crashField: string;
  setCrashField: (crashField: string) => void;
  creatorTool: string;
  setCreatorTool: (creatorTool: string) => void;
  creatorToolName: string;
  setCreatorToolName: (creatorToolName: string) => void;
  crashMetricName: string;
  setCrashMetricName: (crashMetricName: string) => void;
  showFailedAggregationAlerts: boolean;
  setShowFailedAggregationAlerts: (showFailedAggregationAlerts: boolean) => void;
};

type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];

export const persistentProps: NonFunctionPropertyNames<Store>[] = [
  "esURL",
  "kibanaURL",
  "esAPI",
  "esUsername",
  "esPassword",
  "useEsAPI",
  "downloadAPI",
  "downloadPathField",
  "rawFileLocation",
  "downloadMode",
  "s3BucketName",
  "awsProfileName",
  "index",
  "activeField",
  "activeYField",
  "activeColorField",
  "activeSampleSize",
  "sigTermsField",
  "suggestionField",
  "geoSpatialField",
  "completionField",
  "columnOrder",
  "hiddenVizFields",
  "downloadPath",
  "activePage",
  "activeViz",
  "indexMapping",
  "allMappingFields",
  "filterList",
  "nonVisibleFields",
  "nonFilterableFields",
  "recentHexEditorFiles",
  "hexEditorFileDirectory",
  "crashField",
  "creatorTool",
  "creatorToolName",
  "crashMetricName",
  "showFailedAggregationAlerts"
];

export const persistentNonStoredProps: NonFunctionPropertyNames<Store>[] = [
  "recentHexEditorFiles",
  "activePage",
  "activeViz"
];

const useStore = create<Store>(
  persist(
    {
      key: "safedocs",
    },
    (set, get): Store => ({
      esURL: "",
      setEsURL: (esURL: string) => {
        set(() => ({ esURL, loadingIndex: !!get().index }));
        if (!!get().index) {
          let axiosInstance = get().fetchAxios();
          axiosInstance
            .get(`${get().esURL}/${get().index}/_mapping`)
            .then(() => {
              set({ validIndex: true, loadingIndex: false });
            })
            .catch(() => {
              set({ validIndex: false, loadingIndex: false });
            });
        }
      },
      kibanaURL: "https://kibana.safedocs.xyz",
      setKibanaURL: (kibanaURL) => set({ kibanaURL }),
      esUsername: "",
      setEsUsername: (esUsername) => {
        set({ esUsername });
      },
      esPassword: "",
      setEsPassword: (esPassword) => {
        set({ esPassword });
      },
      esAPI: "https://api.safedocs.xyz/v1/elasticsearch/{INDEX}",
      setEsAPI: (esAPI) => {
        set(() => ({ esAPI, loadingIndex: !!get().index }));
        if (get().index) {
          let axiosInstance = get().fetchAxios();
          axiosInstance
            .get(`${get().getSearchURL()}/mapping`)
            .then(() => {
              set({ validIndex: true, loadingIndex: false });
            })
            .catch(() => {
              set({ validIndex: false, loadingIndex: false });
            });
        }
      },
      useEsAPI: true,
      setUseEsAPI: (useEsAPI) => set(() => ({ useEsAPI })),
      getSearchURL: () => {
        if (!get().index || (get().useEsAPI && !get().esAPI) || (!get().useEsAPI && !get().esURL)) {
          return "";
        }
        return get().useEsAPI ? get().esAPI.replace("{INDEX}", get().index) : `${get().esURL}/${get().index}/_search`;
      },
      downloadPathField: "",
      setDownloadPathField: (downloadPathField) => set({ downloadPathField }),
      downloadAPI: "https://api.safedocs.xyz/v1/files",
      setDownloadAPI: (downloadAPI) => set(() => ({ downloadAPI })),
      rawFileLocation: "",
      setRawFileLocation: (rawFileLocation) => set(() => ({ rawFileLocation })),
      downloadMode: "api",
      setDownloadMode: (downloadMode) => set(() => ({ downloadMode })),
      s3BucketName: "",
      setS3BucketName: (s3BucketName) => set(() => ({ s3BucketName })),
      awsProfileName: "",
      setAWSProfileName: (awsProfileName) => set(() => ({ awsProfileName })),
      index: "",
      validIndex: false,
      loadingIndex: false,
      loadingIndexMapping: false,
      fetchAxios: (timed=false) => {
        if (!get().esPassword || !get().esUsername) {
          return axios;
        }

        let authAxios = axios.create({
          httpsAgent: new https.Agent({
            rejectUnauthorized: true
          }),
        });

        if (timed) {
          authAxios.interceptors.request.use((config) => {
            // @ts-ignore
            config.headers["request-start-time"] = performance.now();
            return config;
          });
  
          authAxios.interceptors.response.use((response) => {
            // @ts-ignore
            const duration = performance.now() - (response.config.headers["request-start-time"] as number);
            response.headers["request-duration-seconds"] = `${Math.round(duration) / 1000}`;
            return response;
          });
        }

        const token = Buffer.from(`${get().esUsername}:${get().esPassword}`, "utf8").toString("base64")
        authAxios.defaults.headers.common["Authorization"] = `Basic ${token}`;

        return authAxios;
      },
      setIndex: (index) => {
        set(() => ({
          index,
          loadingIndex: true,
          documents: [],
          aggregations: {},
          activeFilters: [],
          requestedSkip: 0,
          requestedTake: 250,
          selectedDocuments: [],
          totalDocumentCount: 0,
          suggestions: {},
          completions: [],
          geoLocations: [],
          sigTerms: {}
        }));
        if (!index || !get().getSearchURL()) {
          set({ validIndex: false, loadingIndex: false });
          return;
        }
        let url = get().useEsAPI ? `${get().getSearchURL()}/mapping` : `${get().esURL}/${get().index}/_mapping`;

        let axiosInstance = get().fetchAxios();
        axiosInstance.get(url)
          .then((res) => {
            set({ validIndex: true, loadingIndex: false });
          })
          .catch((err) => {
            set({ validIndex: false, loadingIndex: false });
          });
      },
      activePage: 0,
      setActivePage: (activePage) => set({ activePage }),
      activeFilters: [],
      setActiveFilters: (activeFilters) => set({ activeFilters }),
      activeField: "",
      setActiveField: (activeField) => set({ activeField }),
      activeYField: "count",
      setActiveYField: (activeYField) => set({ activeYField }),
      activeColorField: "auto",
      setActiveColorField: (activeColorField) => set({ activeColorField }),
      activeSampleSize: -1,
      setActiveSampleSize: (activeSampleSize) => set({ activeSampleSize }),
      activeViz: "Data Viz",
      setActiveViz: (activeViz) => set({ activeViz }),
      sigTermsField: "tk_creator_tool",
      setSigTermsField: (sigTermsField) => set({ sigTermsField }),
      recentHexEditorFiles: [],
      setRecentHexEditorFiles: (recentHexEditorFiles) => set({ recentHexEditorFiles }),
      hexEditorFileDirectory: "",
      setHexEditorFileDirectory: (hexEditorFileDirectory) => set({ hexEditorFileDirectory }),
      loadingDocuments: false,
      documentError: false,
      setLoadingDocuments: (loadingDocuments) => set({ loadingDocuments }),
      virtualPageSize: 250,
      setVirtualPageSize: (virtualPageSize) => set({ virtualPageSize }),
      columnOrder: [],
      setColumnOrder: (columnOrder) => set({ columnOrder }),
      nonVisibleFields: [],
      setNonVisibleFields: (nonVisibleFields) => set({ nonVisibleFields }),
      hiddenVizFields: [],
      setHiddenVizFields: (hiddenVizFields) => set({ hiddenVizFields }),
      nonFilterableFields: [],
      setNonFilterableFields: (nonFilterableFields) => set({ nonFilterableFields }),
      totalDocumentCount: 0,
      setTotalDocumentCount: (totalDocumentCount) => set({ totalDocumentCount }),
      requestedSkip: 0,
      setRequestedSkip: (requestedSkip) => set({ requestedSkip }),
      requestedTake: 250,
      setRequestedTake: (requestedTake) => set({ requestedTake }),
      searchTerm: "",
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      findTerm: "",
      setFindTerm: (findTerm) => set({ findTerm }),
      advancedSearchOpen: false,
      setAdvancedSearchOpen: (advancedSearchOpen) => set({ advancedSearchOpen }),
      query: { query: { match_all: {} }, size: 250 },
      setQuery: (query) =>
        set({
          query,
          requestedSkip: 0,
          requestedTake: 250,
          documents: [],
          selectedDocuments: [],
          totalDocumentCount: 0,
          loadingDocuments: get().getSearchURL().length > 0,
          virtualPageSize: 250,
          suggestions: {},
          completions: [],
          aggregations: {},
          geoLocations: [],
          sigTerms: {}
        }),
      suggestionField: "q_keys",
      setSuggestionField: (suggestionField) => {
        let query = get().query;
        if (query["suggest"]) {
          query = getSearchQuery(
            get().searchTerm,
            suggestionField,
            get().completionField,
            getGroupedFilters(get().activeFilters),
            get().filterList,
            get().activeViz === "Data Viz"
          );
          set({ suggestionField, suggestions: {}, query });
          get().fetchDocuments();
        } else {
          set({ suggestionField });
        }
      },
      geoSpatialField: "host_location",
      setGeoSpatialField: (geoSpatialField) => set({ geoSpatialField }),
      suggestions: {},
      completionField: "q_parent_and_keys",
      setCompletionField: (completionField) => {
        let query = get().query;
        if (query["suggest"]) {
          query = getSearchQuery(
            get().searchTerm,
            get().suggestionField,
            completionField,
            getGroupedFilters(get().activeFilters),
            get().filterList,
            get().activeViz === "Data Viz"
          );
          set({ completionField, suggestions: {}, query });
          get().fetchDocuments();
        } else {
          set({ completionField });
        }
      },
      completionFields: [],
      completions: [],
      aggregations: {},
      documents: [],
      sort: [],
      setSort: (sort) => set({ sort }),
      requestFetchDocuments: async (requestedSkip = 0, requestedTake = 0) => {
        if (requestedSkip !== get().requestedSkip || requestedTake !== get().requestedTake)
          set({
            requestedSkip,
            requestedTake,
          });
      },
      fetchDocuments: async (sortOrder) => {
        set({ loadingDocuments: true });

        let infiniteQuery = get().query;
        infiniteQuery.size = get().requestedTake;
        infiniteQuery.from = get().requestedSkip;
        infiniteQuery.sort = sortOrder ? sortOrder : get().sort;
        let searchURL = get().getSearchURL();
        if (!searchURL) {
          return new Promise((resolve) => {
            set({
              documents: [],
              selectedDocuments: [],
              totalDocumentCount: 0,
              loadingDocuments: false,
              documentError: true,
            });
            resolve();
          });
        }

        let axiosInstance = get().fetchAxios(true);

        return axiosInstance
          .post(searchURL, infiniteQuery)
          .then((response) => {
            let responseDocuments = get().useEsAPI ? response.data.documents : response.data;
            set({
              documents: sortOrder ? responseDocuments.hits.hits : [...get().documents, ...responseDocuments.hits.hits],
              totalDocumentCount: responseDocuments.hits.total.value,
              loadingDocuments: false,
              documentError: false,
            });
            if (get().activeViz === "Data Viz" && responseDocuments.suggest) {
              let suggestions = responseDocuments.suggest["similarity-suggestion"][0];
              if (suggestions && suggestions.options.length) {
                let options = [suggestions.text, ...suggestions.options.map((option: any) => option.text)];

                let countQuery: Record<string, any> = {
                  query: { match_all: {} },
                  aggs: {},
                  track_total_hits: true,
                  size: 1000,
                };

                options.forEach((option) => {
                  let suggestAgg: Record<string, any> = { filter: { term: {} } };
                  suggestAgg.filter.term[get().suggestionField] = option;
                  countQuery.aggs[option] = suggestAgg;
                });

                let axiosInstance = get().fetchAxios();
                axiosInstance
                  .post(get().getSearchURL(), countQuery)
                  .then((countResponse) => {
                    let countResponseData = get().useEsAPI ? countResponse.data : { documents: countResponse.data };
                    set({ suggestions: countResponseData });
                  })
                  .catch((err) => {
                    set({ suggestions: {} });
                  });
              } else {
                set({ suggestions: {} });
              }

              let completions = responseDocuments.suggest["completion"][0];

              if (completions.options && completions.options.length) {
                Promise.all(
                  completions.options.map((option: any) => {
                    let optionQuery: Record<string, any> = {
                      query: { bool: { must: [] } },
                      size: 0,
                      track_total_hits: true,
                    };
                    let term: Record<string, any> = {
                      term: {},
                    };

                    if (infiniteQuery.query && infiniteQuery.query.bool && infiniteQuery.query.bool.filter) {
                      optionQuery.query.bool["filter"] = infiniteQuery.query.bool.filter;
                    }

                    term.term[get().completionField] = option.text;
                    optionQuery["query"]["bool"]["must"].push(term);

                    let axiosInstance = get().fetchAxios();
                    return axiosInstance.post(get().getSearchURL(), optionQuery);
                  })
                ).then((values) => {
                  let completion_counts = values
                    .map((response, i) => {
                      let responseDocuments = get().useEsAPI ? response.data.documents : response.data;

                      return {
                        completion: completions.options[i].text,
                        count: responseDocuments.hits.total.value,
                      };
                    })
                    .sort((a, b) =>
                      a.count < b.count ? 1 : a.count === b.count ? (a.completion < b.completion ? 1 : -1) : -1
                    );
                  set({ completions: completion_counts });
                });
              } else {
                set({ completions: [] });
              }
            } else {
              set({ suggestions: {}, completions: [] });
            }
          })
          .catch((err) => {
            console.error("Error fetching", err, infiniteQuery);
            set({
              documents: [],
              selectedDocuments: [],
              totalDocumentCount: 0,
              loadingDocuments: false,
              documentError: true,
            });
          });
      },
      plotData: [],
      fetchPlotData: (fields) => {
        let query: Record<string, any> = {
          "query": {
            "function_score": {
              "functions": [
                {
                  "random_score": {}
                }
              ]
            }
          },
          "_source": fields,
          size: get().activeSampleSize
        };


        let axiosInstance = get().fetchAxios();
        axiosInstance
          .post(get().getSearchURL(), query)
          .then((response) => {
            let responseData = get().useEsAPI ? response.data : { documents: response.data };
            set({ plotData: responseData?.documents?.hits?.hits || [] });
          })
          .catch((err) => {
            set({ plotData: [] });
          });
      },
      selectedDocuments: [],
      setSelectedDocuments: (selectedDocuments) => set({ selectedDocuments }),
      filterList: [],
      allMappingFields: [],
      indexMapping: {},
      sigTerms: {},
      fetchSigTerms: () => {
        let sigTermsField = get().sigTermsField;
        let searchTerm = get().searchTerm;
        if (!sigTermsField || !searchTerm) return;

        let query = {
          query: {
            query_string: {
              query: searchTerm, // "q_keys:/.FontDescriptor/"
            },
          },
          size: 0,
          aggregations: {
            my_sample: {
              sampler: {
                shard_size: 100000,
              },
              aggregations: {
                keywords: {
                  significant_terms: {
                    field: `${sigTermsField}.keyword`, // tk_creator_tool
                    chi_square: {
                      background_is_superset: false,
                    },
                  },
                },
              },
            },
          },
        };
        let searchURL = get().getSearchURL();
        if (!searchURL) {
          set({ sigTerms: {} });
          return;
        }

        let axiosInstance = get().fetchAxios();
        axiosInstance.post(searchURL, query).then((response) => {
          let responseDocuments = get().useEsAPI ? response.data.documents : response.data;
          set({ sigTerms: responseDocuments.aggregations });
        });
      },

      fetchFilterAggregations: async (fields, queryOverride) => {
        let axiosInstance = get().fetchAxios();
        let groupedFilters = getGroupedFilters(get().activeFilters);

        set({ aggregations: {} });
        let searchURL = get().getSearchURL();
        if (!searchURL) {
          return;
        }

        let skippedList: string[] = [];
        let requests = [];
        for (let i = 0; i < fields.length; i += 10) {
          let aggQuery = getAggQuery(groupedFilters, fields.slice(i, i + 10), get().searchTerm, queryOverride);
          aggQuery.size = 0;

          requests.push(axiosInstance
            .post(searchURL, aggQuery)
            .then((response) => {
              let responseDocuments = get().useEsAPI ? response.data.documents : response.data;
              set({ aggregations: { ...get().aggregations, ...responseDocuments.aggregations } });
            })
            .catch((err) => {
              console.error("Error fetching aggregation filters", err, aggQuery);
              console.error("Skipping aggregation filters: ", fields.slice(i, i + 10));
              skippedList.push(fields.slice(i, i + 10).join(", "));
              // set({ aggregations: {} });
            }));
        }

        if (get().showFailedAggregationAlerts) {
          Promise.all(requests).then(() => {
            if (skippedList.length > 0) {
              alert("Error fetching aggregation filters for filter list. The following fields were skipped: " + skippedList.join(", "));
            }
          });
        }
      },
      fetchSingleFilterAggregation: async (field, searchTerm) => {
        let searchURL = get().getSearchURL();
        if (!searchURL) {
          return;
        }

        let completionFields = get().completionFields;
        let isCompletionField = completionFields && completionFields.includes(field);

        let query: Record<string, any> = {
          size: 0,
        };

        if (isCompletionField) {
          query = {
            query: {
              match_all: {},
            },
            suggest: {
              completition: {
                prefix: searchTerm,
                completion: {
                  field: `${field}.completion`,
                  size: 10000,
                  skip_duplicates: true,
                },
              },
            },
          };
        } else {
          query = {
            aggs: {},
            query: {
              regexp: {},
            },
          };
          query["query"]["regexp"][field] = {
            value: `.*${searchTerm}.*`,
          };

          query.aggs[field] = {
            terms: {
              field: field,
              size: 1000,
            },
          };
        }

        let axiosInstance = get().fetchAxios();
        return axiosInstance
          .post(searchURL, query)
          .then((response) => {
            let responseDocuments = get().useEsAPI ? response.data.documents : response.data;

            if (isCompletionField && responseDocuments.suggest && responseDocuments.suggest.completition) {
              return responseDocuments.suggest.completition[0].options.map((option: any) => option.text);
            } else {
              // @ts-ignore
              return responseDocuments.aggregations[field]["buckets"]
                .map((bucket: any) => bucket.key)
                .filter((key: string) => key.includes(searchTerm))
                .sort();
            }
          })
          .catch((err) => {
            console.error("Error fetching aggregation filters for", field, err, query);
            return [];
          });
      },
      fetchIndexMapping: () => {
        set({ loadingIndexMapping: true });
        let searchURL = get().getSearchURL();
        if (!searchURL) {
          set({ loadingIndex: false, loadingIndexMapping: false });
          return;
        }
        let axiosInstance = get().fetchAxios();
        let url = get().useEsAPI ? `${searchURL}/mapping` : `${get().esURL}/${get().index}/_mapping`;
        axiosInstance
          .get(url)
          .then((response) => {
            let mapping: any = get().useEsAPI ? response.data.mapping : response.data;
            mapping =
              mapping && Object.entries(mapping).length
                ? (Object.entries(mapping) as any)[0][1]["mappings"]["properties"]
                : {};
            let allMappingFields = Object.entries(mapping).map(([field, _]) => field);
            allMappingFields.sort();
            let keywordFields = Object.entries(mapping) //all fields with type keyword (ES type)
              .filter(([field, meta]: [field: string, meta: any]) => {
                if (meta?.type === "keyword") {
                  return true;
                } else if (meta?.fields && typeof meta.fields === "object" && Object.keys(meta.fields).length > 0) {
                  // Support nested keyword fields
                  return Object.entries(meta.fields).some(([subField, subMeta]: [string, any]) => {
                    return subMeta?.type === "keyword";
                  });
                } else {
                  return false;
                }
              })
              .map(([field, _]) => field);
            keywordFields.sort();

            console.log("keywordFields", keywordFields, mapping)

            if (Object.keys(get().aggregations).length === 0) {
              get().fetchFilterAggregations(keywordFields);
            }

            let columnOrder = get().columnOrder;
            if (columnOrder.length !== allMappingFields.length) {
              let overlappingColumns = columnOrder.filter((column) => allMappingFields.includes(column));
              let newColumns = allMappingFields.filter((column) => !columnOrder.includes(column));
              columnOrder = [...overlappingColumns, ...newColumns];
            }

            let filterList = get().filterList;
            if (filterList.length !== keywordFields.length) {
              let overlappingFilters = filterList.filter((filterField) => keywordFields.includes(filterField));
              let newFilters = keywordFields.filter((filterField) => !filterList.includes(filterField));
              filterList = [...overlappingFilters, ...newFilters];
            }

            let completionFields = Object.entries(mapping)
              .filter(([field, meta]: [field: string, meta: any]) => meta.fields && meta.fields.completion)
              .map(([field, _]) => field);

            set({
              indexMapping: get().useEsAPI ? response.data : { mapping: response.data },
              filterList,
              allMappingFields,
              completionFields,
              columnOrder,
              validIndex: true,
              loadingIndex: false,
              loadingIndexMapping: false,
            });
          })
          .catch(() => {
            set({
              indexMapping: {},
              filterList: [],
              allMappingFields: [],
              columnOrder: [],
              validIndex: false,
              loadingIndexMapping: false,
              loadingIndex: false,
            });
          });
      },

      geoLocations: [],
      fetchGeoLocations: (topLeft = [], bottomRight = [], zoom = 2) => {
        let query = get().query;
        query.size = 0;
        query["aggs"] = {
          filter_agg: {
            filter: {
              geo_bounding_box: {
                ignore_unmapped: true,
              },
            },
            aggs: {
              geo: {
                geohash_grid: {
                  field: get().geoSpatialField,
                  precision: zoom,
                },
                aggs: {
                  coordinates: {
                    geo_centroid: {
                      field: get().geoSpatialField,
                    },
                  },
                },
              },
            },
          },
        };
        query["aggs"]["filter_agg"]["filter"]["geo_bounding_box"][get().geoSpatialField] = {
          top_left: {
            lat: topLeft && topLeft.length === 2 ? topLeft[1] : 90,
            lon: topLeft && topLeft.length === 2 ? topLeft[0] : -180,
          },
          bottom_right: {
            lat: bottomRight && bottomRight.length === 2 ? bottomRight[1] : -90,
            lon: bottomRight && bottomRight.length === 2 ? bottomRight[0] : 180,
          },
        };

        let searchURL = get().getSearchURL();
        if (!searchURL) {
          set({ geoLocations: [] });
          return;
        }

        let axiosInstance = get().fetchAxios(true);
        axiosInstance
          .post(searchURL, query)
          .then((response) => {
            let responseDocuments = get().useEsAPI ? response.data.documents : response.data;
            set({ geoLocations: responseDocuments.aggregations.filter_agg.geo.buckets });
          })
          .catch((err) => {
            console.error(`Error fetching geo locations: ${err}`);
            set({ geoLocations: [] });
          });
      },
      getDocumentsDownloadPaths: (docIDs) => {
        if (get().downloadMode === "local") {
          return [
            encodeURI(
              `${get().downloadAPI}?${docIDs
                .map((docID: any) => `paths=${get().documents[docID]._source[get().downloadPathField]}`)
                .join("&")}`
            ),
          ];
        } else if (get().downloadMode === "s3") {
          return docIDs.map((docID) => get().documents[docID]._source[get().downloadPathField]);
        } else {
          return docIDs.map((docID) =>
            path.join(
              path.normalize(get().rawFileLocation),
              path.normalize(get().documents[docID]._source[get().downloadPathField])
            )
          );
        }
      },
      getRandomDocumentsDownloadPaths: async (count): Promise<string[]> => {
        let query = {
          size: count,
          query: {
            function_score: {
              query: get().query.query,
              random_score: {},
            },
          },
        };
        let searchURL = get().getSearchURL();
        if (!searchURL) {
          return [];
        }

        let axiosInstance = get().fetchAxios(true);
        return axiosInstance.post(searchURL, query).then((response) => {
          let responseDocuments = get().useEsAPI ? response.data.documents : response.data;
          let documents = responseDocuments.hits.hits;
          if (get().downloadMode === "local") {
            return [
              encodeURI(
                `${get().downloadAPI}?${documents
                  .map((document: any) => `paths=${document._source[get().downloadPathField]}`)
                  .join("&")}`
              ),
            ];
          } else if (get().downloadMode === "s3") {
            return documents.map((document: any) => document._source[get().downloadPathField]);
          } else {
            return documents.map((document: any) => {
              return path.join(
                path.normalize(get().rawFileLocation),
                path.normalize(document._source[get().downloadPathField])
              );
            });
          }
        });
      },
      downloadPath: "",
      setDownloadPath: (downloadPath) => set({ downloadPath }),
      fullConfig: {},
      exportConfig: () => {
        let config: Record<string, any> = get().fullConfig;
        config["index"] = get().index;
        if (!config["mappings"]) {
          config["mappings"] = {};
        }
        config["mappings"][get().index] = {};
        persistentProps.forEach((persistentProp) => {
          if ((persistentProp as string) !== "index") {
            config["mappings"][get().index][persistentProp as string] = get()[persistentProp as keyof Store];
          }
        });
        config["version"] = package_json.version;
        return config;
      },
      switchIndexConfig: (newIndex) => {
        let validConfig: Partial<Store> = {};

        let indexConfig = (get().fullConfig["mappings"] || {})[newIndex] || {};
        Object.entries(indexConfig).forEach(([propName, propValue]) => {
          if ((persistentProps as string[]).includes(propName) && propValue !== undefined) {
            validConfig[propName as NonFunctionPropertyNames<Store>] = propValue;
          }
        });
        if (Object.keys(validConfig).length > 0) {
          set(validConfig as any);
        } else {
          set({
            indexMapping: {},
            filterList: [],
            allMappingFields: [],
            columnOrder: [],
          });
          get().fetchIndexMapping();
        }
      },
      importConfig: (config) => {
        set({ fullConfig: config });
        let activeIndex = config["index"];
        let validConfig: Partial<Store> = {};

        let indexConfig = (config["mappings"] || {})[activeIndex] || {};
        Object.entries(indexConfig).forEach(([propName, propValue]) => {
          if (
            (persistentProps as string[]).includes(propName) &&
            !(persistentNonStoredProps as string[]).includes(propName) &&
            propValue !== undefined
          ) {
            validConfig[propName as NonFunctionPropertyNames<Store>] = propValue;
          }
        });
        set(validConfig as any);
        get().fetchIndexMapping();
        get().setQuery({ query: { match_all: {} }, size: 250 });
      },
      reset: () => {
        set({
          esURL: "",
          kibanaURL: "https://kibana.safedocs.xyz",
          esAPI: "https://api.safedocs.xyz/v1/elasticsearch/{INDEX}",
          useEsAPI: true,
          downloadAPI: "https://api.safedocs.xyz/v1/files",
          downloadPathField: "",
          rawFileLocation: "",
          downloadMode: "api",
          s3BucketName: "",
          awsProfileName: "",
          index: "",
          sigTermsField: "tk_creator_tool",
          suggestionField: "q_keys",
          geoSpatialField: "host_location",
          completionField: "q_parent_and_keys",
          columnOrder: [],
          hiddenVizFields: [],
          downloadPath: "",
          activePage: 3,
          activeViz: "Data Viz",
          indexMapping: {},
          allMappingFields: [],
          filterList: [],
          nonVisibleFields: [],
          nonFilterableFields: [],
          recentHexEditorFiles: [],
          hexEditorFileDirectory: "",
        });
      },
      crashField: "tools_status",
      setCrashField: (crashField) => set({ crashField }),
      creatorTool: "tk_creator_tool",
      setCreatorTool: (creatorTool) => set({ creatorTool }),
      creatorToolName: "",
      setCreatorToolName: (creatorToolName) => set({ creatorToolName }),
      crashMetricName: "Frequency",
      setCrashMetricName: (crashMetricName) => set({ crashMetricName }),
      showFailedAggregationAlerts: true,
      setShowFailedAggregationAlerts: (showFailedAggregationAlerts) => set({ showFailedAggregationAlerts }),
    })
  )
);
export default useStore;
