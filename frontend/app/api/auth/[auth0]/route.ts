import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      audience: "https://backend.digitallions.littlelionschildcoaching.com", // Your API audience
    },
  }),
});
