import { jwtDecode } from "jwt-decode";

const withAdminAuth = (WrappedComponent) => {
  return (props) => {
    const accessToken = localStorage.getItem("token") ?? "";

    if (accessToken) {
      const decode = jwtDecode(accessToken);

      if (decode.role !== "Admin") {
        window.location.replace("/accessDenied");
        return null;
      }
    } else {
      window.location.replace("/login");
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAdminAuth;