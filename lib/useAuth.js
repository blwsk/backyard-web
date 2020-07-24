import { useMemo } from "react";

export const useAuth = (override) => {
  return useMemo(() =>
    typeof override === "object"
      ? override
      : {
          isAuthenticated: true,
          user: {
            firstName: "Kevin",
            lastName: "Bielawski",
            id: 1,
          },
        }
  );
};
