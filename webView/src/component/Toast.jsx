import React, { useEffect } from "react";
import ReactDOM from "react-dom";

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // 自动关闭 toast
    }, 3000); // 3秒后自动关闭

    return () => clearTimeout(timer);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div style={toastStyle}>
      <div style={toastMessageStyle}>{message}</div>
    </div>,
    document.body // 你可以选择把 Toast 渲染到 body 或者其他 DOM 节点
  );
};

// Toast 样式
const toastStyle = {
  position: "fixed",
  top: "30px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 9999,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

// 使 toast 更加柔和的样式
const toastMessageStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.8)", // 使用半透明的黑色背景
  color: "#fff", // 白色字体
  padding: "12px 24px", // 增加一些内边距
  borderRadius: "25px", // 圆润的边角
  fontSize: "16px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)", // 柔和的阴影效果
  opacity: 0,
  animation: "fadeIn 0.5s forwards, fadeOut 0.5s 2.5s forwards", // 添加渐变效果
  fontFamily: "'Arial', sans-serif",
  textAlign: "center",
};

export default Toast;
