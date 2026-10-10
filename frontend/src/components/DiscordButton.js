import React, { useState } from "react";
import { Button } from "reactstrap";

import API from "api/API";

// "Continue with Discord" / "Link Discord account". Renders nothing unless Discord is configured on the server.
// mode: "login" (sign in or sign up) or "link" (link Discord to the logged-in account)
function DiscordButton({ mode = "login", label = "Continue with Discord", className = "" }) {
  const api = API.getApi();
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    api.getDiscordConfig().then(config => setEnabled(config.enabled));
    // eslint-disable-next-line
  }, []);

  async function start() {
    const result = await api.getDiscordAuthorizeUrl(mode);
    if (result.url) {
      window.location.assign(result.url);
    } else {
      setError(result.error);
    }
  }

  if (!enabled) {
    return null;
  }
  return (
    <>
      <Button block className={"btn-round discord-button " + className} onClick={start}>
        {label}
      </Button>
      {error && <p className="text-danger">{error}</p>}
    </>
  );
}

export default DiscordButton;
