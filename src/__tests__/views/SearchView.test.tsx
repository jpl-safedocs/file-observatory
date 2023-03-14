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

import React from "react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { render, fireEvent, waitFor, screen } from "../../test-utils";
import "@testing-library/jest-dom";

import SearchView from "../../views/SearchView";

jest.mock(
  "electron",
  () => {
    const mElectron = { ipcRenderer: { on: jest.fn(), send: jest.fn() } };
    return mElectron;
  },
  { virtual: true }
);

const server = setupServer(
  rest.get("http://localhost:9200/file-observatory-cc-dev/_search", (req, res, ctx) => {
    return res(
      ctx.json({
        took: 1,
        timed_out: false,
        _shards: {
          total: 1,
          successful: 1,
          skipped: 0,
          failed: 0,
        },
        hits: {
          total: {
            value: 250,
            relation: "eq",
          },
          max_score: 1,
          hits: [
            {
              _index: "file-observatory-cc-dev",
              _type: "_doc",
              _id: "0",
              _score: 1,
              _source: {
                pinfo_creator: "Acrobat Distiller 4.5 (Windows)",
                pinfo_producer: "Acrobat PDFMaker 10.1 for Word|x|AGO",
                pinfo_created: "2021-08-04T21:46:33Z",
                pinfo_modified: "2021-08-04T21:46:33Z",
                pinfo_tagged: "false",
                pinfo_javascript: "false",
                pinfo_pages: "6",
                pinfo_encrypted: "false",
                pinfo_optimized: "false",
                pinfo_version: "1.7",
                pinfo: "Title: Test Document\nPDF version:    1.7",
                fname:
                  "safedocs-cc-202109/commoncrawl/CC-MAIN-2021-31/00/02/0002716982fbace924265254b5d9f1bb7c5c09588e88d090ca2930d17a17750f",
                original_fname:
                  "safedocs-cc-202109/commoncrawl/CC-MAIN-2021-31/00/02/0002716982fbace924265254b5d9f1bb7c5c09588e88d090ca2930d17a17750f",
                shasum_256: "0002716982fbace924265254b5d9f1bb7c5c09588e88d090ca2930d17a17750f",
                size: "21050",
                collection: "CC-MAIN-2021-31",
                host_location: "33.7484999999999999,-84.3871000000000038",
                country: "US",
                tld: "com",
                url: "http://test.com",
                q_keys: ["/A", "/Rotate"],
                q_parent_and_keys: ["trailer->/Root", "trailer->/Size"],
                q_filters: "/FlateDecode",
                q_keys_and_values: ["/Ascent->NUMBER", "/Author->thebag.com-2021-08-04T00:00:00+00:01"],
                q_max_filter_count: "1",
                q_type_keys: ["/Annot->/A", "/Annot->/Border"],
                tools_status: "mt_success pinfo_success ptt_success q_success tk_success",
                tk_exit: "0",
                tk_num_attachments: "0",
                tk_num_macros: "0",
                tk_creator_tool: "Acrobat Distiller 4.5 (Windows)",
                tk_producer: "Acrobat PDFMaker 10.1 for Word|x|AGO",
                tk_oov: "0.20347155255544835",
                tk_num_tokens: "1138",
                tk_lang_detected: "eng",
                tk_created: "2021-08-04T21:46:33Z",
                tk_modified: "2021-08-04T21:46:33Z",
                tk_mime: "application/pdf",
                tk_mime_detailed: "application/pdf",
                tk_format: "application/pdf; version=1.7",
                tk_title: "Basic Pharmacology For Nurses 15th Fifteenth Edition",
                tk_subject: "basic, pharmacology, for, nurses, 15th, fifteenth, edition",
                tk_pdf_version: "1.7",
                tk_percent_unmapped_unicode: "0.0",
                ptt_lang_detected: "eng",
                mt_lang_detected: "eng",
                overlap_mt_v_ptt: "1",
                overlap_tk_v_ptt: "0.99858558177947998",
                overlap_tk_v_mt: "0.99858558177947998",
                mt_oov: "0.204655674102812823",
                ptt_oov: "0.204655674102812823",
                ptt_num_tokens: "1130",
                mt_num_tokens: "1130",
              },
            },
          ],
        },
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("Loads Search View", async () => {
  Object.defineProperty(window, "require", {
    writable: true,
    value: jest.fn().mockImplementation(require),
  });

  render(<SearchView />);

  await waitFor(() => screen.getByText("Data Viz"));

  expect(screen.getByTestId("search-table-container")).toHaveTextContent("0 ResultsDownloadExpandNothing to show");
});

// test("handles server error", async () => {
//   server.use(
//     rest.get("http://localhost:9200/file-observatory-cc-dev/_search", (req, res, ctx) => {
//       return res(ctx.status(500));
//     })
//   );

//   render(<SearchView />);

//   fireEvent.click(screen.getByText("Load Greeting"));

//   await waitFor(() => screen.getByRole("alert"));

//   expect(screen.getByRole("alert")).toHaveTextContent("Oops, failed to fetch!");
//   expect(screen.getByRole("button")).not.toBeDisabled();
// });
