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

import { FC, useEffect } from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

import useStore from "../../utils/store";

import Treemap from "./Treemap";

import { ActiveIndexProps } from "../Visualizations";

interface SigTermsProps {
  hiddenIndices: number[];
  setHiddenIndices: (indices: number[]) => void;
  activeIndices: ActiveIndexProps[];
  removeNonPermanentIndices: (index: number) => void;
  togglePermanentIndex: (index: number) => void;
  hoverIndex: (index: number) => void;
}

const SigTerms: FC<SigTermsProps> = ({
  hiddenIndices,
  setHiddenIndices,
  activeIndices,
  removeNonPermanentIndices,
  togglePermanentIndex,
  hoverIndex,
}) => {
  const [sigTerms, fetchSigTerms] = useStore((state) => [state.sigTerms, state.fetchSigTerms]);
  const allMappingFields = useStore((state) => state.allMappingFields);
  const [sigTermsField, setSigTermsField] = useStore((state) => [state.sigTermsField, state.setSigTermsField]);
  const searchTerm = useStore((state) => state.searchTerm);

  useEffect(() => {
    fetchSigTerms();
    if (!sigTermsField && allMappingFields.length > 0) {
      setSigTermsField(allMappingFields[0]);
    }
  }, [fetchSigTerms, setSigTermsField, searchTerm, sigTermsField, allMappingFields]);

  return (
    <div style={{ marginTop: "10px" }}>
      <FormControl>
        <InputLabel id="sig-field-label">Field</InputLabel>
        <Select
          id="keyword-filter-select"
          labelId="sig-field-label"
          value={sigTermsField && allMappingFields.includes(sigTermsField) ? sigTermsField : ""}
          label="Field"
          onChange={(evt) => {
            setSigTermsField(evt.target.value);
            setHiddenIndices([]);
          }}
          style={{ margin: "5px" }}
        >
          {allMappingFields.map((filter) => (
            <MenuItem key={`mapping-filter-${filter}`} value={filter}>
              {filter}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div>
        {sigTermsField && sigTerms && (
          <Treemap
            hiddenIndices={hiddenIndices}
            data={sigTerms && sigTerms.my_sample ? sigTerms.my_sample.keywords : { buckets: [] }}
            activeIndices={activeIndices}
            removeNonPermanentIndices={removeNonPermanentIndices}
            togglePermanentIndex={togglePermanentIndex}
            hoverIndex={hoverIndex}
            sizeField="score"
          />
        )}
      </div>
    </div>
  );
};

export default SigTerms;
