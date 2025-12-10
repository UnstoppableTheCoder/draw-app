import { ChangeEvent, Dispatch, RefObject, SetStateAction } from "react";

export default function CanvasInputBox({
  inputRef,
  inputVal,
  setInputVal,
}: {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  inputVal: string;
  setInputVal: Dispatch<SetStateAction<string>>;
}) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputVal(e.target.value);
  };

  return (
    <textarea
      ref={inputRef}
      className={`absolute text-white placeholder:text-white text-[40px] outline-none resize-none field-sizing-content leading-[50px] hidden`}
      id="textarea"
      value={inputVal}
      onChange={handleChange}
    ></textarea>
  );
}
