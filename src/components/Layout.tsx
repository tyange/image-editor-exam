import { ReactNode } from "react";
import Header from "./Header";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="w-full h-screen flex flex-col">
      <Header />
      <main className="flex justify-center items-center flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
