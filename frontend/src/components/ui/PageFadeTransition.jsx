import React from "react";

export default function PageFadeTransition({ children, key }) {
  return (
    <div key={key} className="page-fade-transition">
      {children}
    </div>
  );
}
