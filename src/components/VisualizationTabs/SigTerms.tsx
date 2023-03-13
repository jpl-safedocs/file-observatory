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
