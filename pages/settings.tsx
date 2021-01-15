import Header from "../components/header";
import Wrapper from "../components/wrapper";
import { useState, useEffect, useRef } from "react";
import { useAuthedCallback, useAuthedSWR } from "../lib/requestHooks";
import { jsonFetcherFactory, gqlFetcherFactory } from "../lib/fetcherFactories";
import requireAuth from "../lib/requireAuth";
import gql from "gql-tag";
import { mutate } from "swr";
import { PhoneNumber } from "twilio/lib/interfaces";
import { TWILIO_PHONE_NUMBER } from "../lib/twilioConstants";
import { validURL } from "../lib/urls";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";

const userMetadataQuery = gql`
  query UserMetadataForUser($userId: String!) {
    userMetadataForUser(userId: $userId) {
      phoneNumber
      emailIngestAddress
    }
    rssSubscriptionsForUser(userId: $userId, _size: 100) {
      data {
        feedUrl
        _id
      }
    }
  }
`;

const CopiedAlert = ({ onTimeout, className }) => {
  const [show, updateShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      updateShow(false);
      onTimeout();
    }, 1000);

    return () => clearTimeout(t);
  }, []);

  return (
    show && (
      <div className={className}>
        <span className="bg-black text-white py-1 px-2 rounded">Copied</span>
      </div>
    )
  );
};

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
      <TextInput
        className="mt-2 mr-2"
        value={phoneValue}
        onChange={(e) => updatePhoneValue(e.target.value)}
        disabled={hasSentPin || error}
        placeholder="1234567890"
      />
      <Button
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
      </Button>
      {error && <div className="color-red">❌ Pin failed to send.</div>}
      {hasSentPin &&
        (!hasConfirmedPin ? (
          <>
            <br />
            <TextInput
              className="mt-2 mr-2"
              value={pinValue}
              onChange={(e) => updatePinValue(e.target.value)}
            />
            <Button
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
            </Button>
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
    <div>
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
      <div className="pt-4">
        {phoneNumber ? (
          <TextInput className="mt-2 mr-2" readOnly value={phoneNumber} />
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
      <Button
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
      </Button>
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
  const ref = useRef<HTMLTextAreaElement>();
  const [copied, updateCopied] = useState(false);

  return (
    <div>
      <h4>Add content with email</h4>
      <div>
        Create an email address to use when subscribing to newsletters. New
        posts will automatically be added.
      </div>
      <div className="pt-4">
        {emailIngestAddress ? (
          <div className="relative">
            <textarea
              ref={(current) => (ref.current = current)}
              className="form-input bg-gray-100 dark:bg-gray-900 dark:border-gray-900 full-width"
              id="email"
              style={{ marginTop: 8, marginRight: 8, width: "100%" }}
              readOnly
              value={emailIngestAddress}
              onFocus={() => {
                try {
                  navigator.clipboard.writeText(emailIngestAddress).then(() => {
                    updateCopied(true);
                    ref.current.blur();
                  });
                } catch (error) {
                  void error;
                }
              }}
            />
            {copied && (
              <CopiedAlert
                className="absolute inset-0 flex items-center justify-center"
                onTimeout={() => updateCopied(false)}
              />
            )}
          </div>
        ) : (
          <CreateEmailIngestAddress />
        )}
      </div>
    </div>
  );
};

const RssFeed = ({ feedUrl, id }: { feedUrl: string; id: string }) => {
  const [deleteState, update] = useState<"loading" | "error">(null);

  const doDelete = useAuthedCallback(
    gql`
      mutation {  
        deleteRssSubscription(id: ${id}) {
          _id
        }
      }
    `,
    {},
    gqlFetcherFactory
  );

  return (
    <div className="flex justify-between md:items-center flex-col md:flex-row max-w-full mb-2">
      <a href={feedUrl}>{feedUrl}</a>
      <Button
        size="small"
        variant="secondary"
        onClick={() => {
          update("loading");
          doDelete()
            .catch(() => update("error"))
            .finally(() => mutate(userMetadataQuery));
        }}
      >
        <small className="text-md">Unsubscribe</small>
      </Button>
      {deleteState === "loading" && <span>Deleting...</span>}
      {deleteState === "error" && <span className="text-red-500">Error</span>}
    </div>
  );
};

const RssSubscriptions = ({
  rssFeeds,
}: {
  rssFeeds: { feedUrl: string; _id: string }[];
}) => {
  const [feedUrl, updateUrl] = useState<string>("");
  const [subscribeState, update] = useState<"loading" | "error">(null);

  const doSubscribe = useAuthedCallback(
    "/api/rss/subscribe",
    {
      method: "POST",
      body: JSON.stringify({ feedUrl }),
    },
    jsonFetcherFactory
  );

  return (
    <div>
      <h4>Subscribe to RSS feeds</h4>
      <div>
        Whenever new posts are added to these feeds, they'll appear in your
        saved content.
      </div>
      <div className="pt-4">
        {rssFeeds.length > 0 ? (
          <div>
            {rssFeeds.map(({ feedUrl, _id }) => (
              <RssFeed key={_id} feedUrl={feedUrl} id={_id} />
            ))}
          </div>
        ) : (
          <div>None! Save one 👇</div>
        )}
        <div className="mt-6 flex flex-col md:flex-row">
          <TextInput
            className=" flex-grow mr-2"
            value={feedUrl}
            onChange={(e) => updateUrl(e.target.value)}
            disabled={subscribeState === "loading"}
            placeholder="https://example.com/rss"
          />
          <Button
            onClick={() => {
              update("loading");
              doSubscribe()
                .then(() => update(null))
                .catch(() => update("error"))
                .finally(() => mutate(userMetadataQuery));
            }}
            disabled={subscribeState === "loading" || !validURL(feedUrl)}
          >
            Subscribe
          </Button>
          {subscribeState === "loading" && <span>Loading...</span>}
          {subscribeState === "error" && (
            <span className="text-red-500">Error</span>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsForm = ({ data }) => {
  const {
    userMetadataForUser: { phoneNumber, emailIngestAddress },
    rssSubscriptionsForUser: { data: rssFeeds },
  } = data.data;

  return (
    <div>
      <div className="mb-10">
        <PhoneNumberSetting phoneNumber={phoneNumber} />
      </div>
      <div className="mb-10">
        <EmailIngestSetting emailIngestAddress={emailIngestAddress} />
      </div>
      <div className="mb-10">
        <RssSubscriptions rssFeeds={rssFeeds} />
      </div>
      <Guide />
    </div>
  );
};

const Guide = () => (
  <div>
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
  const { data } = useAuthedSWR(userMetadataQuery, gqlFetcherFactory);

  return (
    <div>
      <Header />
      <Wrapper>
        <h1>Settings</h1>
        {data ? <SettingsForm data={data} /> : <div>Loading...</div>}
      </Wrapper>
    </div>
  );
};

export default requireAuth(Settings);
