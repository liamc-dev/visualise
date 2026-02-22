import { useEffect, useMemo } from "react";
import type { CodeBundle, CodeLang } from "../../types/algo-types";
import { CODE_LANG_LABELS } from "../../types/algo-types";
import { useCodeLangStore } from "../../stores/useCodeLangStore";
import ButtonSelect from "../ui/portal-select/ButtonSelect"; // <-- wrapper
import type { PortalSelectOption } from "../ui/portal-select/PortalSelectBase";

export default function CodeLangSelect({ bundle }: { bundle: CodeBundle }) {
  const lang = useCodeLangStore((s) => s.lang);
  const setLang = useCodeLangStore((s) => s.setLang);

  const options = useMemo<PortalSelectOption<CodeLang>[]>(() => {
    const langs = Object.keys(bundle.sources) as CodeLang[];
    return langs.map((value) => ({
      value,
      label: CODE_LANG_LABELS[value] ?? value,
    }));
  }, [bundle]);

  useEffect(() => {
    if (!bundle.sources[lang]) {
      setLang((bundle.sources.pseudo ? "pseudo" : options[0]?.value) ?? "pseudo");
    }
  }, [bundle, lang, options, setLang]);

  return (
    <ButtonSelect<CodeLang>
      value={lang}
      options={options}
      onChange={setLang}
      menuWidth="content"
    />
  );
}
