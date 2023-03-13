import { FC } from "react";
import useStore from "../../utils/store";

const Kibana: FC = () => {
  const kibanaURL = useStore((state) => state.kibanaURL);
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <iframe id="kibana" title="Kibana" width="100%" height="100%" src={kibanaURL}></iframe>
    </div>
  );
};

export default Kibana;
