import { PublicClientApplication, LogLevel } from "@azure/msal-browser";
import { MsalService, MsalBroadcastService, MsalGuardConfiguration } from "@azure/msal-angular";

export const msalConfig = {
  auth: {
    clientId: "fb2b3471-e81a-4a45-94e1-9acafa5fee05",
    authority: "https://login.microsoftonline.com/d21da106-c49f-4232-beb2-392b49819418",
    redirectUri: "http://localhost:4200/",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true,
  },
};

export const loginRequest = {
  scopes: ["User.Read"], // we can add Microsoft Graph permissions later
};