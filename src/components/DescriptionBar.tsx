import { Props } from "../utils/types";

export function DescriptionBar({ text }: Props) {
  return (
    <div className="tn-desc-bar">
      <span className="tn-desc-text">
        {text.split(/(\[.*?\])/).map((chunk, i) =>
          chunk.startsWith("[") && chunk.endsWith("]") ? (
            <span key={i} className="tn-desc-em">
              {chunk}
            </span>
          ) : (
            <span key={i}>{chunk}</span>
          )
        )}
      </span>
    </div>
  );
}