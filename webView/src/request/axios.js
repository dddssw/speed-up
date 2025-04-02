import axios from "axios";
import data from '@/data/token'
// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: "http://47.103.24.76:3000",
  timeout: 5000, // 可选的超时设置
});

// 设置请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 在请求发送之前，你可以在这里修改请求头
    const token = data.token; // 假设你从某个地方获取到了 token
console.log(token,'ooo');
    // 如果 token 存在，在请求头中添加 Authorization 字段
     if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
     }

    // 可以返回修改后的配置
    return config;
  },
  (error) => {
    // 如果请求出错（例如网络问题），会进入此处
    return Promise.reject(error);
  }
);

export default axiosInstance;
