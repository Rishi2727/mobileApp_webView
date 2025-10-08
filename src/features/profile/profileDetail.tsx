import React from "react";

type ProfileIconProps = {
  text?: string;
  textColor?: string;
  bgColor?: string;
  circleBgColor?: string;
  width?: number | string;
  height?: number | string;
};

const ProfileDetail: React.FC<ProfileIconProps> = ({
  text = "HC",
  textColor = "#FFFFFF",
  bgColor = "#4F8DFB",
  circleBgColor = "#E0E7FF",
  width = 120,
  height = 120,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 705.46 452.44"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#E5E7EB"
        d="M128.81 40.24l447.84 0c71.13,0 128.81,58.71 128.81,131.1l0 0c0,72.39 -57.68,131.1 -128.81,131.1l-447.84 0c-71.13,-0 -128.81,-58.71 -128.81,-131.1l-0 0c0,-72.39 57.68,-131.1 128.81,-131.1z"
      />
      <path
        fill={bgColor}
        d="M131.22 40.24l0 -40.24c-85.72,22.97 -131.1,98.93 -131.1,171.34 0,72.41 58.69,131.1 131.1,131.1 72.41,0 131.1,-58.69 131.1,-131.1 0,-72.41 -58.69,-131.1 -131.1,-131.1z"
      />
      <circle fill={circleBgColor} cx="131.22" cy="171.34" r="92.87" />
      <circle fill="#1F2937" cx="131.22" cy="171.34" r="88.48" />
      <text
        x="105.12"
        y="190.66"
        fill={textColor}
        fontWeight="bold"
        fontSize="53.96"
        fontFamily="Arial"
      >
        {text}
      </text>
    </svg>
  );
};

export default ProfileDetail;
