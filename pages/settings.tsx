import Header from "../components/header";
import Wrapper from "../components/wrapper";
import { useState } from "react";
import { useAuthedCallback, useAuthedSWR } from "../lib/requestHooks";
import { jsonFetcherFactory, gqlFetcherFactory } from "../lib/fetcherFactories";
import requireAuth from "../lib/requireAuth";
import gql from "gql-tag";
import { mutate } from "swr";
import { PhoneNumber } from "twilio/lib/interfaces";
import { TWILIO_PHONE_NUMBER } from "../lib/twilioConstants";

const userMetadataQuery = gql`
  query UserMetadataForUser($userId: String!) {
    userMetadataForUser(userId: $userId) {
      phoneNumber
      emailIngestAddress
    }
  }
`;

const ValidatePhoneNumber = () => {
  const [phoneValue, updatePhoneValue] = useState("");
  const [hasSentPin, updateHasSentPin] = useState(false);
  const [error, updateError] = useState(false);

  const [pinValue, updatePinValue] = useState("");
  const [hasConfirmedPin, updateHasConfirmedPin] = useState(false);
  const [pinConfirmationError, updatePinConfirmationError] = useState(false);

  const doVerify = useAuthedCallback(
    "/api/sms/verify",
    {
      method: "POST",
      body: JSON.stringify({
        phoneNumber: phoneValue,
      }),
    },
    jsonFetcherFactory
  );

  const doConfirm = useAuthedCallback(
    "/api/sms/confirm",
    {
      method: "POST",
      body: JSON.stringify({
        pin: pinValue,
      }),
    },
    jsonFetcherFactory
  );

  return (
    <div>
      <input
        type="text"
        id="phone"
        style={{ marginTop: 8, marginRight: 8 }}
        value={phoneValue}
        onChange={(e) => updatePhoneValue(e.target.value)}
        disabled={hasSentPin || error}
        placeholder="1234567890"
      />
      <button
        onClick={() => {
          doVerify()
            .then((res) => {
              void res;
              updateHasSentPin(true);
            })
            .catch((err) => {
              void err;
              updateError(true);
            });
        }}
        disabled={hasSentPin || error}
      >
        Verify
      </button>
      {error && <div className="color-red">❌ Pin failed to send.</div>}
      {hasSentPin &&
        (!hasConfirmedPin ? (
          <>
            <br />
            <input
              type="text"
              style={{ marginTop: 8, marginRight: 8 }}
              value={pinValue}
              onChange={(e) => updatePinValue(e.target.value)}
            />
            <button
              onClick={() => {
                doConfirm()
                  .then((res) => {
                    void res;
                    updateHasConfirmedPin(true);

                    /**
                     * Refresh userMetadata query after 2 seconds
                     */
                    setTimeout(() => mutate(userMetadataQuery), 1000);
                  })
                  .catch((err) => {
                    void err;
                    updatePinConfirmationError(true);
                  });
              }}
              disabled={hasConfirmedPin || pinConfirmationError}
            >
              Confirm pin
            </button>
          </>
        ) : (
          <div style={{ marginTop: 8 }}>
            ✅ Your phone number has been confirmed.
          </div>
        ))}
      {pinConfirmationError && (
        <div className="color-red" style={{ marginTop: 8 }}>
          ❌ Pin confirmation failed.
        </div>
      )}
    </div>
  );
};

type PhoneNumberProps = {
  phoneNumber: PhoneNumber | null;
};

const PhoneNumberSetting = ({ phoneNumber }: PhoneNumberProps) => {
  return (
    <div className="well">
      <label htmlFor="phone">
        <h4>Save content via SMS</h4>
        {phoneNumber ? (
          <div>
            <span>
              Your phone number is verified ✅. Send messages to the Backyard
              phone number{", "}
            </span>
            <a href={`tel:${TWILIO_PHONE_NUMBER}`}>{TWILIO_PHONE_NUMBER}</a>
            <span>{", to add content."}</span>
          </div>
        ) : (
          <div>
            <span>
              Verify your phone number, then send messages to the Backyard phone
              number{", "}
            </span>
            <a href={`tel:${TWILIO_PHONE_NUMBER}`}>{TWILIO_PHONE_NUMBER}</a>
            <span>{", to add content."}</span>
          </div>
        )}
      </label>
      <div className="p-top-4">
        {phoneNumber ? (
          <input
            type="text"
            id="phone"
            style={{ marginTop: 8, marginRight: 8 }}
            readOnly
            value={phoneNumber}
          />
        ) : (
          <ValidatePhoneNumber />
        )}
      </div>
    </div>
  );
};

const CreateEmailIngestAddress = () => {
  const [loading, updateLoading] = useState(false);
  const [success, updateSuccess] = useState(false);
  const [error, updateError] = useState(false);

  const doCreate = useAuthedCallback(
    "/api/email/create",
    {
      method: "POST",
    },
    jsonFetcherFactory
  );

  return (
    <div>
      <button
        style={{ marginRight: 8 }}
        onClick={() => {
          updateLoading(true);
          doCreate()
            .then((res) => {
              updateLoading(false);

              updateSuccess(true);

              setTimeout(() => mutate(userMetadataQuery), 1000);
            })
            .catch((err) => {
              void err;

              updateLoading(false);

              updateError(true);
            });
        }}
      >
        Create
      </button>
      {loading && <span>Loading...</span>}
      {success && <span>Sucess ✅</span>}
      {error && <span className="color-red">Error ❌</span>}
    </div>
  );
};

type EmailIngestProps = {
  emailIngestAddress: string | null;
};

const EmailIngestSetting = ({ emailIngestAddress }: EmailIngestProps) => {
  return (
    <div className="well">
      <label htmlFor="email">
        <h4>Add content with email</h4>
        <div>
          Create an email address to use when subscribing to newsletters. New
          posts will automatically be added.
        </div>
      </label>
      <div className="p-top-4">
        {emailIngestAddress ? (
          <input
            type="text"
            id="email"
            style={{ marginTop: 8, marginRight: 8, width: "100%" }}
            readOnly
            value={emailIngestAddress}
          />
        ) : (
          <CreateEmailIngestAddress />
        )}
      </div>
    </div>
  );
};

const SettingsForm = ({ data }) => {
  const {
    userMetadataForUser: { phoneNumber, emailIngestAddress },
  } = data.data;

  return (
    <div>
      <div className="m-bottom-6">
        <PhoneNumberSetting phoneNumber={phoneNumber} />
      </div>
      <div className="m-bottom-6">
        <EmailIngestSetting emailIngestAddress={emailIngestAddress} />
      </div>
    </div>
  );
};

const Guide = () => (
  <div className="well">
    <h3>Other ways to save</h3>
    <ul>
      <li>
        <span style={{ marginRight: 8 }}>
          Drag this bookmarklet onto your bookmark bar:
        </span>
        <span
          dangerouslySetInnerHTML={{
            __html: `
        <a  href="javascript:(function hey(){ window.open('https://backyard.wtf/save?url=' + encodeURIComponent(window.location.href), '_blank'); })()">
          <pre style="display:inline;">Save</pre>
        </a>
      `,
          }}
        />
      </li>
      <li>
        Send links, images, files, and text to{" "}
        <a href={`tel:${TWILIO_PHONE_NUMBER}`}>{TWILIO_PHONE_NUMBER}</a> via SMS
        🔜
      </li>
      <li>Drag-and-drop a file to upload it 🆕</li>
    </ul>
  </div>
);

const Settings = () => {
  const { data, error, isValidating } = useAuthedSWR(
    userMetadataQuery,
    gqlFetcherFactory
  );

  void error, isValidating;

  return (
    <div>
      <Header />
      <Wrapper>
        <h1>Settings</h1>
        {data && <SettingsForm data={data} />}
        <Guide />
      </Wrapper>
    </div>
  );
};

export default requireAuth(Settings);
