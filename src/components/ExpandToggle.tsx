import { FC } from "react";
import { Template, TemplatePlaceholder, Plugin } from "@devexpress/dx-react-core";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";

interface Props {
  expand: boolean;
  setExpand: (expand: boolean) => void;
}

const ExpandToggle: FC<Props> = ({ expand, setExpand }) => {
  return (
    <Plugin name="UploadButton" dependencies={[{ name: "Toolbar" }]}>
      <Template name="toolbarContent">
        <TemplatePlaceholder />
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => setExpand(!expand)}>
          <span style={{ marginRight: "5px" }}>{!expand ? "Expand" : "Collapse"}</span>
          <div
            style={{
              borderRadius: "5px",
              background: "#4682C8",
              width: "30px",
              height: "30px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
            }}
          >
            {expand ? <ArrowLeftIcon fontSize="large" /> : <ArrowRightIcon fontSize="large" />}
          </div>
        </div>
      </Template>
    </Plugin>
  );
};

export default ExpandToggle;
