import React, { useState, useEffect } from "react";
import { withRouter } from "next/router";
import { validURL } from "../lib/urls";
import Button from "./ui/Button";
import TextInput from "./ui/TextInput";
import { classNames } from "../lib/classNames";

export const SaveBar = withRouter(({ router }) => {
  const [value, updater] = useState("");
  const [focused, updateFocused] = useState(true);

  const onChange = (e) => {
    updater(e.target.value);
  };

  const onSave = () => {
    router.push(`/save?url=${encodeURI(value)}`);
  };

  const isValidUrl = validURL(value);

  const inputError = !isValidUrl && value.length > 0 && !focused;

  const onFocus = () => {
    updateFocused(true);
  };

  const onBlur = () => {
    updateFocused(false);
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      onSave();
    }
  };

  return (
    <>
      <div className="save-bar">
        <TextInput
          className={classNames("w-full mb-4", {
            error: inputError,
          })}
          placeholder="https://url-you-want-to-save.com"
          value={value}
          autoFocus
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
        {(value || focused) && (
          <Button onClick={onSave} disabled={!isValidUrl}>
            Save
          </Button>
        )}
      </div>
      <style jsx>{`
        .save-bar {
          width: 100%;
          textalign: center;
          height: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </>
  );
});
